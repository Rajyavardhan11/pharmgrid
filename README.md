Live link: https://pharmgrid.onrender.com/

# PharmGrid · High-Reliability Pharmacy Operations Console

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](backend/app/main.py)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.6-4169E1?logo=postgresql&logoColor=white)](docker-compose.yml)
[![HAProxy](https://img.shields.io/badge/HAProxy-3.1-00557F?logo=haproxy&logoColor=white)](infra/haproxy.cfg)
[![Terraform](https://img.shields.io/badge/AWS%20Terraform-Blueprints-7B42BC?logo=terraform&logoColor=white)](infra/terraform/)
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen)](tests/)

**PharmGrid** is a mission-critical pharmacy operations console, inventory safety ledger, and resilience demonstrator. Built with a dual-replica FastAPI backend, PostgreSQL 16 ACID transactions, HAProxy load balancing, an asynchronous background worker queue, and comprehensive real-world pharmacy workflows (GRN inwarding, atomic billing, chronic care reminders, GST thermal receipts, distributor credit notes, and automated S3 disaster recovery rehearsals).

---

## 🏛 System Architecture

```text
               PUBLIC TRAFFIC / COUNTER BROWSER
                             │
                             ▼ (Port 80 / 8080)
                 ┌───────────────────────┐
                 │  HAProxy Load Balancer │
                 └───────────┬───────────┘
                             │ (Roundrobin / Health-checked)
              ┌──────────────┴──────────────┐
              ▼                             ▼
   ┌─────────────────────┐       ┌─────────────────────┐
   │  FastAPI Replica A  │       │  FastAPI Replica B  │
   │    (Port 8000)      │       │    (Port 8000)      │
   └──────────┬──────────┘       └──────────┬──────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼ (Private Network)
                 ┌───────────────────────┐
                 │ PostgreSQL 16 (ACID)  │◄──┐
                 │  Row Lock: FOR UPDATE │   │ (Poll & Lease)
                 └───────────────────────┘   │
                             ▲               │
                             │   ┌───────────┴──────────┐
                             └───┤ Async Worker Queue   │
                                 │ (Retry & DLQ Engine) │
                                 └──────────────────────┘
```

---

## 🚀 Key Features

### 1. Pharmacy Operations & Counter Workflows
- **Atomic Billing Counter:** Prevents overselling using PostgreSQL `FOR UPDATE` row-level locks. Idempotent checkouts cache transaction digests to prevent duplicate charges upon network drops.
- **Customer CRM & Chronic Refill Reminders:** Captures Patient Name, Mobile (+91), and Doctor Rx number. Includes a 30-day chronic medication refill scheduler that queues automated patient alerts in the background ledger.
- **80mm Thermal Printable Receipts & UPI Bharat QR:** In-modal receipt viewer rendered with HSN 3004 tax breakdown (CGST 6% + SGST 6%), Drug License No. (`KA-BLR-2026-91`), and dynamic vector UPI QR code for instant smartphone payment scanning. Print-ready via `window.print()`.
- **Inward Stock Receiving Desk (GRN):** Dedicated Goods Receipt Note flow to inward shipments directly from distributors (MedSource Logistics, Apollo Warehousing) with manufacturer batch, expiry date, and unit cost.
- **Near-Expiry Markdown & Distributor Return (Credit Note):** 1-click -20% clearance pricing for batches expiring within 60 days, and 1-click **Return to Distributor** generating auditable Credit Notes (`CN-YYYYMM-XXXX`) while moving stock to quarantine.
- **What-If Reorder Lab:** Interactive stock survival slider curves with real-time SVG projection, cliff-point calculation, and formal Purchase Order draft transmission.

### 2. High-Availability & Cloud Reliability Engineering
- **Live Chaos Simulator:** Interactive failover and resilience deck testing:
  - *Idempotency Replay Safety:* Confirms zero double-deduction on repeated payloads.
  - *Poison Message DLQ Isolation:* Injects failing jobs to verify worker backoff and dead-letter queue routing.
  - *Dual Replica Health:* Inspects HAProxy backend node availability.
- **Automated S3 Encrypted Backup & Restore Rehearsal:** Live SQL database snapshot verification, KMS AES-256-GCM checksum generation, and simulated restore rehearsal measuring **RPO = 0s** and **RTO = ~40ms**.
- **SLO Scoreboard & Cryptographic Proof Pack:** Live verification of non-negative stock, lot balance integrity, and transaction consistency. Exports downloadable SHA-256 proof pack JSONs.
- **Multi-Role RBAC:** Role-based access control supporting `ADMIN`, `MANAGER`, `COUNTER`, and `AUDITOR` with `bcrypt` password hashing and secure `HttpOnly` cookie session handling.
- **Night-Shift Dark Mode & Audio Feedback:** High-contrast dark theme (`🌙`/`☀️`) for 24-hour night shifts, plus pure Web Audio API synthesizer feedback (click on item add, chime on checkout, warning buzz on hold).

---

## ⚡ Quick Start (Docker)

### 1. Prerequisites
- Docker & Docker Compose installed on your system.

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optionally modify `.env` passwords or keep the defaults for local testing).*

### 3. Start the Cluster
```bash
docker compose up -d
```
All 5 microservices will build and launch:
- `pharmgrid-proxy-1`: HAProxy load balancer on port `80`
- `pharmgrid-api_a-1`: FastAPI primary node on port `8000`
- `pharmgrid-api_b-1`: FastAPI secondary node on port `8000`
- `pharmgrid-worker-1`: Asynchronous notification and retry worker
- `pharmgrid-postgres-1`: PostgreSQL 16 database (health-checked)

### 4. Open the Application
Navigate to **[http://localhost](http://localhost)** in your browser.

- **Bootstrap Admin Login:**
  - **Email:** `rajyavardhanchauhan01@gmail.com`
  - **Password:** `RajAdmin!2026Secure#82`
- **Or Self-Register:** Click the **Create Account / Register** tab to sign up with any custom role.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Destination |
| :--- | :--- |
| **⌘ K** / **Ctrl+K** | Open Quick Command Palette |
| **⌘ 1** / **Ctrl+1** | Today's Operations Dashboard |
| **⌘ 2** / **Ctrl+2** | Billing Counter |
| **⌘ 3** / **Ctrl+3** | Stock & Expiry Inventory |
| **⌘ 4** / **Ctrl+4** | Alert Centre |
| **⌘ 5** / **Ctrl+5** | Reorder Desk (What-If Lab) |
| **⌘ 6** / **Ctrl+6** | Delivery Radar & Queue |
| **⌘ 7** / **Ctrl+7** | Reliability Centre |
| **⌘ 8** / **Ctrl+8** | Cloud Lab Architecture |

---

## 🧪 Automated Test Suite

PharmGrid includes comprehensive unit, contract, and end-to-end integration test suites:

```bash
# Run Frontend Tests (Node.js Test Runner)
npm test

# Run Backend Tests (Pytest + SQLAlchemy + FastAPI)
backend/.venv/bin/pytest
```

**Results:**
```text
✔ only non-secret session metadata is saved in browser storage
✔ session clear removes browser metadata
✔ readSession gracefully handles invalid, missing, or malformed data
✔ same payload yields same SHA-256 fingerprint
✔ changed payload changes fingerprint
tests/test_production_contracts.py .... PASSED
backend/tests/test_auth_and_routes.py ....... PASSED
======================= 16 passed, 0 failures =======================
```

---

## 🌐 Free Cloud Deployment

### 1. Instant 30-Second Public HTTPS URL (Zero Cost, No Signup)
To make your running setup live on the internet immediately:
```bash
cloudflared tunnel --url http://localhost:80
```
Cloudflare will output a public HTTPS domain (e.g., `https://xxxx.trycloudflare.com`) accessible from any smartphone or computer worldwide.

### 2. Permanent 24/7 Hosting on Render.com (Free Tier)
1. Push this repository to your personal GitHub account.
2. Sign in to [Render.com](https://render.com) using GitHub.
3. Click **New +** → **PostgreSQL** → Choose **Free Tier** → Create Database.
4. Click **New +** → **Web Service** → Select this repository → Choose **Docker** runtime.
5. In Environment Variables, set `DATABASE_URL` to your Render Internal Database Connection String.
6. Deploy! Your app will be live at `https://pharmgrid.onrender.com`.

### 3. Enterprise AWS Production (Terraform)
Complete Infrastructure as Code (IaC) blueprints are located in [infra/terraform/](infra/terraform/):
- **VPC:** 3-tier dual-AZ isolated network ([vpc.tf](infra/terraform/vpc.tf))
- **ALB:** Application Load Balancer with HTTPS redirect ([alb.tf](infra/terraform/alb.tf))
- **Compute:** ARM64 Graviton EC2 instances ([ec2.tf](infra/terraform/ec2.tf))
- **Database:** Encrypted RDS PostgreSQL 16 ([rds.tf](infra/terraform/rds.tf))
- **Storage:** AES-256 encrypted S3 backup bucket ([s3.tf](infra/terraform/s3.tf))
- **Messaging:** SES sender verification + SQS DLQ ([messaging.tf](infra/terraform/messaging.tf))
- **Observability & Budget:** CloudWatch alarms ([cloudwatch.tf](infra/terraform/cloudwatch.tf)) and $18 USD monthly cost cap ([budgets.tf](infra/terraform/budgets.tf)).

---

## 🔒 Security & Regulatory Note

This project is built under strict compliance standards:
- **Synthetic Data Boundary:** Designed exclusively for synthetic fixtures and operational demonstrations. Do not store unencrypted live patient records without completing full HIPAA/DPDP compliance audits.
- **Credential Safety:** Passwords are encrypted with `bcrypt` (12 rounds) and never saved in client browser storage. Sessions are isolated inside `HttpOnly; SameSite=Strict` cookies.
- **Integrity Proof:** Every commit, invoice, and inward GRN generates a cryptographically hashed audit event in PostgreSQL.

---

## 📄 License

MIT License. Designed and maintained for modern pharmacy operations and resilient cloud architecture.
