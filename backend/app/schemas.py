from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "ADMIN"
    branch_id: int = 1


class SaleLineIn(BaseModel):
    lot_id: int
    quantity: int = Field(gt=0, le=10_000)
    unit_paise: int = Field(gt=0, le=10_000_000)


class SaleIn(BaseModel):
    lines: list[SaleLineIn] = Field(min_length=1, max_length=100)
    customer_name: str | None = None
    customer_phone: str | None = None
    doctor_rx: str | None = None
    chronic_refill: bool = False


class InwardShipmentRequest(BaseModel):
    po_number: str | None = None
    distributor: str = "MedSource Healthcare Logistics"
    sku: str
    product_name: str
    lot_code: str
    packs: int = Field(default=100, gt=0, le=5000)
    unit_paise: int = Field(default=32000, gt=0)
    expiry_days: int = Field(default=180, ge=30, le=1000)


class MarkdownRequest(BaseModel):
    discount_percent: int = Field(default=20, ge=5, le=80)


class ReturnDistributorRequest(BaseModel):
    reason: str = "Near expiry clearance"
    distributor: str = "MedSource Healthcare Logistics"


class ChaosTestRequest(BaseModel):
    scenario: str = "network_retry"


class ProductCreate(BaseModel):
    sku: str
    name: str
    lot_code: str
    packs: int = Field(default=50, ge=1, le=1000)
    unit_paise: int = Field(default=32000, ge=100, le=10_000_000)
    expiry_days: int = Field(default=120, ge=1, le=1000)


class HoldToggle(BaseModel):
    held: bool


class AlertAssign(BaseModel):
    alert_id: str
    assignee: str
    note: str = ""


class AlertResolve(BaseModel):
    alert_id: str
    note: str = ""


class JobCreate(BaseModel):
    recipient: str = "counter@pharmgrid.local"
    subject: str = "Manual stock verification signal"
    body: str = "Operational action requested by branch admin."
