output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "application_url" {
  description = "Target public application URL"
  value       = "https://${var.app_subdomain}"
}

output "s3_backup_bucket" {
  description = "S3 bucket for encrypted PostgreSQL database dumps"
  value       = aws_s3_bucket.backups.id
}

output "rds_endpoint" {
  description = "Private PostgreSQL database endpoint"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "PostgreSQL port"
  value       = aws_db_instance.postgres.port
}

output "ses_sender_identity" {
  description = "Verified SES sender identity"
  value       = aws_ses_email_identity.alert_sender.email
}

output "sqs_alerts_queue_url" {
  description = "SQS queue URL for asynchronous alerts"
  value       = aws_sqs_queue.alerts_queue.id
}

output "sqs_alerts_dlq_url" {
  description = "SQS dead letter queue URL"
  value       = aws_sqs_queue.alerts_dlq.id
}
