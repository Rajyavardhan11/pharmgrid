# Amazon SES Verified Sender Email Identity
resource "aws_ses_email_identity" "alert_sender" {
  email = var.alert_sender_email
}

# Dead Letter Queue for Failed Notifications (5+ attempts)
resource "aws_sqs_queue" "alerts_dlq" {
  name                      = "${var.project_name}-alerts-dlq"
  message_retention_seconds = 1209600 # 14 days
  kms_master_key_id         = "alias/aws/sqs"

  tags = {
    Name = "${var.project_name}-alerts-dlq"
  }
}

# SQS Queue for Asynchronous Operational Notifications
resource "aws_sqs_queue" "alerts_queue" {
  name                      = "${var.project_name}-alerts-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600 # 4 days
  receive_wait_time_seconds = 10
  kms_master_key_id         = "alias/aws/sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.alerts_dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "${var.project_name}-alerts-queue"
  }
}

# SNS Topic for Delivery Tracking and SES Feedback
resource "aws_sns_topic" "notification_events" {
  name              = "${var.project_name}-notification-events"
  kms_master_key_id = "alias/aws/sns"

  tags = {
    Name = "${var.project_name}-notification-events"
  }
}
