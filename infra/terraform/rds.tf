# Subnet Group across private database subnets
resource "aws_db_subnet_group" "postgres" {
  name        = "${var.project_name}-db-subnet-group"
  description = "Subnet group for private PostgreSQL database"
  subnet_ids  = [aws_subnet.db_a.id, aws_subnet.db_b.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# Parameter group enforcing SSL/TLS connections
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-postgres16-params"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-db-params"
  }
}

# Master Database Password generated securely without hardcoding
resource "random_password" "db_password" {
  length  = 24
  special = false
}

# RDS PostgreSQL 16 Instance
resource "aws_db_instance" "postgres" {
  identifier                  = "${var.project_name}-db"
  engine                      = "postgres"
  engine_version              = "16.6"
  instance_class              = var.db_instance_class
  allocated_storage           = var.db_allocated_storage_gb
  max_allocated_storage       = 50
  storage_type                = "gp3"
  storage_encrypted           = true
  db_name                     = "pharmgrid"
  username                    = "pharmgrid_app"
  password                    = random_password.db_password.result
  db_subnet_group_name        = aws_db_subnet_group.postgres.name
  vpc_security_group_ids      = [aws_security_group.db.id]
  parameter_group_name        = aws_db_parameter_group.postgres.name
  publicly_accessible         = false
  backup_retention_period     = 7
  backup_window               = "20:00-21:00"
  maintenance_window          = "Sun:21:30-Sun:22:30"
  auto_minor_version_upgrade  = true
  skip_final_snapshot         = true
  deletion_protection         = false

  tags = {
    Name = "${var.project_name}-postgres"
  }
}
