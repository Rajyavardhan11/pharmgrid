from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.bootstrap import seed_admin_and_starter_data
from app.database import Base, db_session
from app.main import app
from app.models import Branch, Inventory, Lot, Product, Role, User
from app.security import passwords


engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


def setup_module():
    Base.metadata.create_all(engine)
    with TestingSession.begin() as db:
        branch = Branch(code="TEST", name="Test branch")
        db.add(branch); db.flush()
        db.add(User(email="admin@example.test", password_hash=passwords.hash("a-very-long-test-password"), role=Role.ADMIN, branch_id=branch.id))
        product = Product(sku="TEST-001", name="Test product")
        db.add(product); db.flush()
        lot = Lot(product_id=product.id, lot_code="LOT-1", expiry_exclusive=date.today() + timedelta(days=30))
        db.add(lot); db.flush()
        db.add(Inventory(branch_id=branch.id, lot_id=lot.id, on_hand=10))
    app.dependency_overrides[db_session] = override_db


def teardown_module():
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


def test_login_sets_httponly_session_and_protects_operations():
    client = TestClient(app)
    assert client.get("/api/v1/ops/notification-jobs").status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": "wrong-password"}).status_code == 401
    login = client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": "a-very-long-test-password"})
    assert login.status_code == 200
    assert "httponly" in login.headers["set-cookie"].lower()
    assert "access_token" not in login.json()
    assert client.get("/api/v1/auth/session").json()["role"] == "ADMIN"
    assert client.get("/api/v1/ops/notification-jobs").status_code == 200
    assert client.post("/api/v1/auth/logout").status_code == 204
    assert client.get("/api/v1/auth/session").status_code == 401


def test_checkout_requires_session_and_replays_only_same_payload():
    anonymous = TestClient(app)
    request = {"lines": [{"lot_id": 1, "quantity": 1, "unit_paise": 32000}]}
    assert anonymous.post("/api/v1/checkout", headers={"Idempotency-Key": "test-key-1"}, json=request).status_code == 401
    client = TestClient(app)
    client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": "a-very-long-test-password"})
    first = client.post("/api/v1/checkout", headers={"Idempotency-Key": "test-key-1"}, json=request)
    replay = client.post("/api/v1/checkout", headers={"Idempotency-Key": "test-key-1"}, json=request)
    changed = client.post("/api/v1/checkout", headers={"Idempotency-Key": "test-key-1"}, json={"lines": [{"lot_id": 1, "quantity": 2, "unit_paise": 32000}]})
    assert first.status_code == 201
    assert replay.status_code == 201 and replay.json()["replayed"] is True
    assert replay.json()["invoice_id"] == first.json()["invoice_id"]
    assert changed.status_code == 409


def test_bootstrap_admin_login():
    bootstrap_email = "bootstrap_admin@example.test"
    bootstrap_pass = "bootstrap-super-secret-pass-2026"
    with TestingSession.begin() as db:
        seed_admin_and_starter_data(db, bootstrap_email, bootstrap_pass)

    client = TestClient(app)
    bad = client.post("/api/v1/auth/login", json={"email": bootstrap_email, "password": "wrong"})
    assert bad.status_code == 401

    res = client.post("/api/v1/auth/login", json={"email": bootstrap_email, "password": bootstrap_pass})
    assert res.status_code == 200
    assert res.json()["email"] == bootstrap_email
    assert res.json()["role"] == "ADMIN"

    sess = client.get("/api/v1/auth/session")
    assert sess.status_code == 200
    assert sess.json()["email"] == bootstrap_email


def test_static_index_served():
    client = TestClient(app)
    res = client.get("/")
    assert res.status_code == 200
    assert '<div id="app"></div>' in res.text


def test_register_new_admin_user():
    client = TestClient(app)
    new_user = {
        "email": "dr_sharma@pharmgrid.local",
        "password": "StrongPassword!2026",
        "role": "ADMIN"
    }
    # Register succeeds and sets session cookie
    reg = client.post("/api/v1/auth/register", json=new_user)
    assert reg.status_code == 201
    assert reg.json()["email"] == new_user["email"]
    assert "pharmgrid_access" in reg.headers["set-cookie"]

    # Verify session reflects the newly registered user
    sess = client.get("/api/v1/auth/session")
    assert sess.status_code == 200
    assert sess.json()["email"] == new_user["email"]

    # Duplicate registration fails
    dup = client.post("/api/v1/auth/register", json=new_user)
    assert dup.status_code == 409


def test_interactive_products_and_alerts():
    client = TestClient(app)
    client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": "a-very-long-test-password"})

    # List products
    products = client.get("/api/v1/products")
    assert products.status_code == 200
    assert len(products.json()) >= 1

    # Add a product
    new_prod = {
        "sku": "PG-TEST-99",
        "name": "Vitamin C 500mg",
        "lot_code": "VTC-99A",
        "packs": 45,
        "unit_paise": 15000,
        "expiry_days": 180
    }
    create = client.post("/api/v1/products", json=new_prod)
    assert create.status_code == 201
    assert create.json()["sku"] == "PG-TEST-99"

    # List alerts
    alerts = client.get("/api/v1/alerts")
    assert alerts.status_code == 200

    # Invariant checker
    inv = client.post("/api/v1/reliability/check-invariants")
    assert inv.status_code == 200
    assert "manifest_sha256" in inv.json()
    assert len(inv.json()["results"]) == 4


def test_advanced_pharmacy_and_reliability_operations():
    client = TestClient(app)
    client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": "a-very-long-test-password"})

    # 1. Test Inward Shipment (GRN)
    grn_payload = {
        "po_number": "PO-2026-TEST",
        "distributor": "MedSource Healthcare Logistics",
        "sku": "PG-GRN-01",
        "product_name": "Amoxicillin Clavulanate 625mg",
        "lot_code": "AMC-625X",
        "packs": 80,
        "unit_paise": 48000,
        "expiry_days": 365
    }
    grn = client.post("/api/v1/ops/inward-shipment", json=grn_payload)
    assert grn.status_code == 201
    assert "GRN-" in grn.json()["grn_id"]
    assert grn.json()["packs_inwarded"] == 80

    # 2. Test Near-Expiry Markdown
    prods = client.get("/api/v1/products").json()
    target_lot = prods[0]["lot_id"]
    md = client.post(f"/api/v1/lots/{target_lot}/markdown", json={"discount_percent": 25})
    assert md.status_code == 200
    assert md.json()["discount_percent"] == 25

    # 3. Test Checkout with Customer Info & Chronic Refill
    sale_payload = {
        "lines": [{"lot_id": target_lot, "quantity": 1, "unit_paise": prods[0]["price"]}],
        "customer_name": "Ramesh Kumar",
        "customer_phone": "9876543210",
        "doctor_rx": "RX-BLR-9081",
        "chronic_refill": True
    }
    sale = client.post("/api/v1/checkout", json=sale_payload, headers={"Idempotency-Key": "chronic_test_01"})
    assert sale.status_code == 201
    assert sale.json()["customer_name"] == "Ramesh Kumar"
    assert sale.json()["chronic_refill"] is True

    # 4. Test Backup Rehearsal
    rehearsal = client.post("/api/v1/reliability/backup-rehearsal")
    assert rehearsal.status_code == 200
    assert rehearsal.json()["status"] == "REHEARSAL_VERIFIED"
    assert "sha256_checksum" in rehearsal.json()
    assert rehearsal.json()["rpo_seconds"] == 0

    # 5. Test Chaos Simulate
    chaos = client.post("/api/v1/reliability/chaos-simulate", json={"scenario": "replica_health"})
    assert chaos.status_code == 200
    assert len(chaos.json()["replicas"]) == 2

    # 6. Test Financial Analytics
    analytics = client.get("/api/v1/analytics/financial")
    assert analytics.status_code == 200
    assert analytics.json()["invoice_count"] >= 1
    assert analytics.json()["total_revenue_paise"] > 0
    assert analytics.json()["cgst_paise"] + analytics.json()["sgst_paise"] == analytics.json()["total_gst_paise"]


