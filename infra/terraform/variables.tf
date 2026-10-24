variable "aws_region" {
  type        = string
  default     = "ap-south-1"
  description = "AWS region for deployment (e.g. ap-south-1 for Mumbai)"
}

variable "project_name" {
  type        = string
  default     = "pharmgrid"
  description = "Project name prefix used for resource naming and tagging"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment name"
}

variable "root_domain" {
  type        = string
  default     = "pharmgrid.in"
  description = "Apex domain owned by the organization"
}

variable "app_subdomain" {
  type        = string
  default     = "app.pharmgrid.in"
  description = "Fully qualified subdomain for the PharmGrid web application"
}

variable "monthly_budget_usd" {
  type        = number
  default     = 18
  description = "Monthly budget cap in USD (~₹1,500) for cost guardrail alerts"
}

variable "budget_notification_emails" {
  type        = list(string)
  default     = ["rajyavardhanchauhan01@gmail.com"]
  description = "Email addresses to notify when budget thresholds (80%, 100%) are reached"
}

variable "alert_sender_email" {
  type        = string
  default     = "alerts@pharmgrid.in"
  description = "Sender email address for Amazon SES alerts"
}

variable "ec2_instance_type" {
  type        = string
  default     = "t4g.small"
  description = "EC2 instance type for the Docker Compose application host (ARM64 Graviton)"
}

variable "db_instance_class" {
  type        = string
  default     = "db.t4g.micro"
  description = "RDS instance class for PostgreSQL 16"
}

variable "db_allocated_storage_gb" {
  type        = number
  default     = 20
  description = "Allocated storage in GB for RDS PostgreSQL"
}
