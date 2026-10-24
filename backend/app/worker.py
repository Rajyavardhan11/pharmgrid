"""Bounded queue worker. SES is only called after a job has committed to PostgreSQL."""
import time
import uuid
from datetime import datetime, timedelta, timezone
import boto3
from sqlalchemy import select
from .config import settings
from .database import SessionLocal
from .models import JobStatus, NotificationJob


def deliver(job: NotificationJob) -> None:
    cfg = settings()
    if cfg.email_transport == "fake":
        return
    if not cfg.ses_sender:
        raise RuntimeError("SES sender not configured")
    boto3.client("ses", region_name=cfg.aws_region).send_email(Source=cfg.ses_sender, Destination={"ToAddresses": [job.recipient]}, Message={"Subject": {"Data": job.subject}, "Body": {"Text": {"Data": job.body}}})


def run_once() -> int:
    now = datetime.now(timezone.utc)
    claimed = 0
    with SessionLocal.begin() as db:
        jobs = db.execute(
            select(NotificationJob)
            .where(NotificationJob.status.in_([JobStatus.QUEUED, JobStatus.RETRY_SCHEDULED]))
            .order_by(NotificationJob.id)
            .limit(20)
            .with_for_update(skip_locked=True)
        ).scalars().all()
        for job in jobs:
            job.status = JobStatus.LEASED
            job.lease_token = uuid.uuid4().hex
            job.lease_until = now + timedelta(seconds=120)
            claimed += 1
            print(f"[Worker] Leased job #{job.id} for {job.recipient}", flush=True)

    for job in jobs:
        try:
            deliver(job)
            with SessionLocal.begin() as db:
                stored = db.get(NotificationJob, job.id)
                if stored and stored.lease_token == job.lease_token:
                    stored.status = JobStatus.PROVIDER_ACCEPTED
                    stored.attempts += 1
                    print(f"[Worker] Delivered job #{job.id} (Status: PROVIDER_ACCEPTED)", flush=True)
        except Exception as e:
            with SessionLocal.begin() as db:
                stored = db.get(NotificationJob, job.id)
                if stored and stored.lease_token == job.lease_token:
                    stored.attempts += 1
                    stored.status = JobStatus.DEAD_LETTER if stored.attempts >= 5 else JobStatus.RETRY_SCHEDULED
                    print(f"[Worker] Failed job #{job.id}: {e} (Status: {stored.status})", flush=True)
    return claimed


if __name__ == "__main__":
    print(f"[Worker] Notification worker started. Poll interval: {settings().worker_poll_seconds}s", flush=True)
    while True:
        run_once()
        time.sleep(settings().worker_poll_seconds)
