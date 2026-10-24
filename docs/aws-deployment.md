# AWS Deployment Architecture and Runbook

This document details the production AWS infrastructure configuration specified in `infra/terraform/` for PharmGrid.

> **Deployment Boundary:** No live cloud resources have been provisioned or charged. All cloud assets exist as infrastructure-as-code blueprints and contract-validated templates. The verified active environment remains the local Docker multi-container topology.

---

## Target Cloud Topology

```text
                             [ Internet ]
                                  │
                                  ▼
                   [ AWS Route 53 (DNS) + ACM TLS ]
                                  │
                                  ▼
        [ Public Subnets: Application Load Balancer (ALB) ]
                     Port 80 (Redirect to 443) / Port 443
                                  │
                                  ▼
   [ Private App Subnets: EC2 Host (Docker Compose Topology) ]
      ┌──────────────────────────────────────────────────┐
      │  HAProxy (8080) ──► API Replicas (FastAPI :8000) │
      │  Notification Worker (Async SQS / SES dispatch)  │
      └──────────────────────────────────────────────────┘
                 │                             │
                 ▼                             ▼
    [ Private DB Subnets: RDS ]     [ S3 Encrypted Backups ]
       PostgreSQL 16 Engine             pg_dump AES-256
       Port 5432 (SSL forced)           Lifecycle: 90 Days
```

---

## Terraform Infrastructure Modules (`infra/terraform/`)

| File | Purpose | Key Guardrails |
|---|---|---|
| `vpc.tf` | 3-tier VPC (`10.0.0.0/16`) | Dual AZs, public/private/database subnets, NAT Gateway for private updates |
| `security_groups.tf` | Strict network segregation | Ingress 80/443 to ALB only; EC2 accepts only from ALB SG; RDS accepts only from EC2 SG |
| `alb.tf` | Application Load Balancer | HTTP to HTTPS redirection (301), TLS 1.3 policy, health check on `/health` |
| `rds.tf` | Managed PostgreSQL 16 | Private-only, automated daily snapshots, storage encrypted with AWS KMS |
| `ec2.tf` | Container Compute Host | ARM64 Graviton (`t4g.small`), IAM instance profile, AWS SSM access (no open SSH port 22) |
| `s3.tf` | Database Backup Storage | Server-side AES-256 encryption, versioning enabled, public access blocked, 90-day lifecycle |
| `messaging.tf` | Alert Pipeline | SES identity (`alerts@pharmgrid.in`), SQS queue with Dead Letter Queue (DLQ) after 5 retries |
| `cloudwatch.tf` | Observability & Alarms | Log groups for API & worker, metric alarms for High CPU (>80%), unhealthy hosts, DLQ messages |
| `budgets.tf` | Cost Guardrail Alert | Monthly budget threshold with automated email alerts at 80% (forecasted) and 100% (actual) |
| `dns.tf` | DNS & Certificates | Route 53 ALIAS record and ACM automated DNS validation |

---

## Future Execution Runbook (When Ready to Deploy)

When an organization is ready to deploy to a funded AWS account:

1. **Prerequisites in AWS Account:**
   - Active AWS account with Root MFA enabled and zero root access keys.
   - IAM deployment identity with restricted administrator permissions.
   - Verified domain hosted in Route 53 (e.g. `pharmgrid.in`).

2. **Configure Variables:**
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with approved domain, region, and budget limit
   ```

3. **Plan and Apply:**
   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

4. **Verify Application:**
   - Run Alembic schema migrations: `alembic upgrade head`
   - Run initial seed: `python -m app.bootstrap`
   - Verify health: `curl -I https://app.pharmgrid.in/health`
