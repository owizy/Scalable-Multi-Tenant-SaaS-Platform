variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (prod, staging)"
  type        = string
  default     = "prod"
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL instance"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Primary application domain name"
  type        = string
  default     = "example.com"
}
