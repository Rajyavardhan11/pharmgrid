import hashlib
import json
import uuid
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import AuditEvent, IdempotencyCommand, Inventory, Invoice, InvoiceLine, Lot, NotificationJob, Product, User
from .schemas import SaleIn


IST = ZoneInfo("Asia/Kolkata")


def saleable(inv: Inventory, lot: Lot) -> int:
    if lot.held or lot.expiry_exclusive <= datetime.now(IST).date():
        return 0
    return max(0, inv.on_hand - inv.damaged - inv.return_reserved)


def request_hash(payload: SaleIn) -> str:
    stable = json.dumps(payload.model_dump(mode="json"), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(stable.encode()).hexdigest()


def checkout(db: Session, actor: User, key: str, payload: SaleIn) -> dict:
    """Locks lots/inventory in deterministic order and commits invoice, audit and jobs together."""
    digest = request_hash(payload)
    prior = db.get(IdempotencyCommand, key)
    if prior:
        if prior.actor_id != actor.id:
            raise HTTPException(status_code=403, detail="Idempotency response is outside caller scope")
        if prior.request_hash != digest:
            raise HTTPException(status_code=409, detail="IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD")
        return {**json.loads(prior.response_json), "replayed": True}
    line_ids = sorted(line.lot_id for line in payload.lines)
    if len(line_ids) != len(set(line_ids)):
        raise HTTPException(status_code=422, detail="Duplicate lot line")
    lots = db.execute(select(Lot).where(Lot.id.in_(line_ids)).order_by(Lot.product_id, Lot.id).with_for_update()).scalars().all()
    if len(lots) != len(line_ids):
        raise HTTPException(status_code=404, detail="Lot not found")
    inventories = db.execute(select(Inventory).where(Inventory.branch_id == actor.branch_id, Inventory.lot_id.in_(line_ids)).order_by(Inventory.lot_id).with_for_update()).scalars().all()
    inv_by_lot = {x.lot_id: x for x in inventories}; lot_by_id = {x.id: x for x in lots}
    total = 0
    for line in payload.lines:
        lot, inv = lot_by_id[line.lot_id], inv_by_lot.get(line.lot_id)
        if not inv or saleable(inv, lot) < line.quantity:
            raise HTTPException(status_code=409, detail=f"LOT_NOT_SALEABLE:{line.lot_id}")
        total += line.quantity * line.unit_paise
    if total <= 0:
        raise HTTPException(status_code=422, detail="Invalid total")
    invoice = Invoice(public_id=f"INV-{uuid.uuid4().hex[:10].upper()}", branch_id=actor.branch_id,
                      total_paise=total, business_date=datetime.now(IST).date())
    db.add(invoice); db.flush()
    for line in payload.lines:
        inv_by_lot[line.lot_id].on_hand -= line.quantity
        db.add(InvoiceLine(invoice_id=invoice.id, lot_id=line.lot_id, quantity=line.quantity, unit_paise=line.unit_paise))
    response = {
        "invoice_id": invoice.public_id,
        "total_paise": total,
        "business_date": invoice.business_date.isoformat(),
        "customer_name": payload.customer_name,
        "customer_phone": payload.customer_phone,
        "doctor_rx": payload.doctor_rx,
        "chronic_refill": payload.chronic_refill,
        "replayed": False,
    }
    db.add(IdempotencyCommand(key=key, actor_id=actor.id, request_hash=digest, response_json=json.dumps(response)))
    audit_detail = {
        "total_paise": total,
        "customer_name": payload.customer_name,
        "customer_phone": payload.customer_phone,
        "doctor_rx": payload.doctor_rx,
        "chronic_refill": payload.chronic_refill,
    }
    db.add(AuditEvent(actor_id=actor.id, event_type="SALE_COMMITTED", entity_type="invoice", entity_id=invoice.public_id, detail_json=json.dumps(audit_detail)))
    db.add(NotificationJob(recipient="operations@example.invalid", subject=f"Sale {invoice.public_id}", body="Synthetic notification job queued after sale commit."))
    if payload.chronic_refill and payload.customer_phone:
        refill_date = (datetime.now(IST).date() + timedelta(days=28)).isoformat()
        db.add(NotificationJob(
            recipient=f"{payload.customer_phone}@pharmgrid.sms",
            subject=f"Chronic Refill Reminder: Rx {payload.doctor_rx or invoice.public_id}",
            body=f"Dear {payload.customer_name or 'Patient'}, your 30-day maintenance regimen is scheduled for refill on {refill_date}."
        ))
    db.commit()
    return response
