"""Create the first branch, administrator and synthetic starter inventory once."""
import os
from datetime import date, timedelta
from dotenv import load_dotenv
from .database import SessionLocal
from .models import Branch, Inventory, Lot, Product, Role, User
from .security import passwords

load_dotenv()


def required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required; do not use a default production password")
    return value


def seed_admin_and_starter_data(db, email: str, password: str) -> User:
    branch = db.query(Branch).filter_by(code="IND").first()
    if not branch:
        branch = Branch(code="IND", name="Indiranagar")
        db.add(branch)
        db.flush()
    user = db.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, password_hash=passwords.hash(password), role=Role.ADMIN, branch_id=branch.id, active=True)
        db.add(user)
    else:
        user.password_hash = passwords.hash(password)
        user.role = Role.ADMIN
        user.active = True
        user.branch_id = branch.id
    for sku, name, lot_code, packs, days in [
        ("PG-001", "Paracetamol 500 mg", "SYNTH-PAR-01", 100, 180),
        ("PG-008", "Amoxicillin 500 mg", "SYNTH-AMX-01", 80, 90),
    ]:
        product = db.query(Product).filter_by(sku=sku).first()
        if not product:
            product = Product(sku=sku, name=name)
            db.add(product)
            db.flush()
        lot = db.query(Lot).filter_by(product_id=product.id, lot_code=lot_code).first()
        if not lot:
            lot = Lot(product_id=product.id, lot_code=lot_code, expiry_exclusive=date.today() + timedelta(days=days))
            db.add(lot)
            db.flush()
        if not db.query(Inventory).filter_by(branch_id=branch.id, lot_id=lot.id).first():
            db.add(Inventory(branch_id=branch.id, lot_id=lot.id, on_hand=packs))
    return user


def main():
    email, password = required("BOOTSTRAP_ADMIN_EMAIL").lower(), required("BOOTSTRAP_ADMIN_PASSWORD")
    with SessionLocal.begin() as db:
        seed_admin_and_starter_data(db, email, password)
    print(f"Bootstrap complete for {email}. Synthetic data only.")


if __name__ == "__main__":
    main()
