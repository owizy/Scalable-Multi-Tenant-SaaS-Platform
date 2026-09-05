resource "aws_db_subnet_group" "main" {
  name       = "multi-tenant-db-subnet-group"
  subnet_ids = ["subnet-12345678", "subnet-87654321"]

  tags = {
    Name = "Multi Tenant DB Subnet Group"
  }
}

resource "aws_security_group" "db_sg" {
  name        = "multi-tenant-db-sg"
  description = "Allow inbound PostgreSQL traffic from EKS worker nodes"
  vpc_id      = "vpc-12345678"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier            = "multi-tenant-postgres-${var.environment}"
  allocated_storage     = 50
  max_allocated_storage = 500
  engine                = "postgres"
  engine_version        = "16.1"
  instance_class        = "db.r6g.large"
  db_name               = "multitenant"
  username              = "dbadmin"
  password              = var.db_password
  db_subnet_group_name  = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  multi_az                  = true
  storage_encrypted         = true
  kms_key_id                = aws_kms_key.app_kms.arn
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "multi-tenant-postgres-final-snapshot"

  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:30-Sun:05:30"
}
