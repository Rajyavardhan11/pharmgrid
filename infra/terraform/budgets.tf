# Monthly AWS Cost Budget Alert Guardrail
resource "aws_budgets_budget" "monthly_cost" {
  name              = "${var.project_name}-monthly-cost-guardrail"
  budget_type       = "COST"
  limit_amount      = tostring(var.monthly_budget_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  # Alert at 80% of budget (Forecasted)
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.budget_notification_emails
  }

  # Alert at 100% of budget (Actual spend)
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.budget_notification_emails
  }

  tags = {
    Name = "${var.project_name}-budget-guardrail"
  }
}
