# CloudWatch Log Group for Application and Replicas
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/pharmgrid/api"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-api-logs"
  }
}

# CloudWatch Log Group for Background Worker
resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/pharmgrid/worker"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-worker-logs"
  }
}

# CloudWatch Alarm: EC2 High CPU Utilization
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  alarm_name          = "${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2 instance CPU exceeded 80% for 10 minutes"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  tags = {
    Name = "${var.project_name}-cpu-alarm"
  }
}

# CloudWatch Alarm: Dead Letter Queue Messages (Notification Delivery Failure)
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "${var.project_name}-dlq-messages-detected"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Dead-letter queue contains unhandled failed notifications"

  dimensions = {
    QueueName = aws_sqs_queue.alerts_dlq.name
  }

  tags = {
    Name = "${var.project_name}-dlq-alarm"
  }
}

# CloudWatch Alarm: Unhealthy Hosts in Target Group
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${var.project_name}-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "ALB detected one or more unhealthy application targets"

  dimensions = {
    TargetGroup  = aws_lb_target_group.app.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Name = "${var.project_name}-unhealthy-hosts-alarm"
  }
}
