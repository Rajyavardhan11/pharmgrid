from pathlib import Path


def test_compose_has_private_data_network():
    compose = Path("docker-compose.yml").read_text()
    assert "internal: true" in compose
    assert "api_a" in compose and "api_b" in compose and "worker" in compose


def test_real_store_replaces_json_demo_in_production_path():
    service = Path("backend/app/services.py").read_text()
    assert "with_for_update" in service
    assert "IdempotencyCommand" in service
    assert "NotificationJob" in service


def test_no_secrets_in_example():
    content = Path(".env.example").read_text()
    assert "replace-with-long" in content


def test_terraform_architecture_contracts():
    s3_tf = Path("infra/terraform/s3.tf").read_text()
    assert "aws_s3_bucket_server_side_encryption_configuration" in s3_tf
    assert "aws_s3_bucket_public_access_block" in s3_tf

    rds_tf = Path("infra/terraform/rds.tf").read_text()
    assert "storage_encrypted           = true" in rds_tf
    assert "publicly_accessible         = false" in rds_tf

    budget_tf = Path("infra/terraform/budgets.tf").read_text()
    assert "aws_budgets_budget" in budget_tf

    alb_tf = Path("infra/terraform/alb.tf").read_text()
    assert "aws_lb" in alb_tf
    assert "aws_lb_target_group" in alb_tf

    tfvars_example = Path("infra/terraform/terraform.tfvars.example").read_text()
    assert "admin@pharmgrid.in" in tfvars_example

