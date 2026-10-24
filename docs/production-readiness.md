# PharmGrid production-readiness plan

## What is now in the repository

- FastAPI + SQLAlchemy PostgreSQL service foundation with role-scoped JWT authentication.
- Transactional checkout design: deterministic `FOR UPDATE` lot/inventory locks, integer paise, expiry/hold checks, idempotency response store, invoice lines, audit event and notification job in one database commit.
- Separate worker with `SKIP LOCKED` claims, lease token, bounded batch and fake/SES delivery modes.
- Docker Compose topology: HAProxy, two API replicas, worker and private PostgreSQL network.
- Docker hardening: non-root runtime and builder-only compiler/dependency layer.
- Cloud topology materials: EC2 replicas, EBS/RDS target, S3 backup target, SES/SNS/SQS integration target, CloudWatch target, VPC/IAM constraints.

## Required before real data or public deployment

1. Install Docker locally and execute real PostgreSQL integration and concurrency tests.
   Run `alembic -c alembic.ini upgrade head` once before APIs receive traffic, then run `python -m app.bootstrap` with bootstrap credentials held only in `.env`.
2. Replace the currently bundled demo frontend API call with authenticated FastAPI calls through the proxy.
3. Add and run Alembic migration history rather than using any automatic schema creation.
4. Provide AWS account, a limited IAM deployment role, target region, domain/Route 53 decision, SES verified sender/domain, and a budget alarm threshold.
5. Provision AWS through reviewed Terraform/CloudFormation, then validate TLS, backups, restore rehearsal, CloudWatch alarms, SES sandbox status, SNS/SQS feedback and incident runbook.
6. Conduct privacy/security review before processing patient or customer personal data. The application must remain synthetic-only until that review is complete.

## Honest status

The local multi-container stack (HAProxy, two FastAPI replicas, PostgreSQL 16, async notification worker, and authenticated single-page application) is fully executed, tested, and verified locally on Docker at `http://localhost`.

The cloud infrastructure configuration (`infra/terraform/`) has been completed as an infrastructure-as-code foundation for VPC, EC2, RDS, ALB, S3 encrypted backups, SES, SQS/DLQ, CloudWatch, and budget guardrails. No AWS credit card or cloud resources have been provisioned or billed. Live AWS items remain **NOT_DEPLOYED / READY FOR PROVISIONING**.
