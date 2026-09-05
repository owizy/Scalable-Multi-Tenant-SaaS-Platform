resource "aws_kms_key" "app_kms" {
  description             = "KMS Master Key for Multi-Tenant Data & Field Encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "multi-tenant-kms-key"
  }
}

resource "aws_kms_alias" "app_kms_alias" {
  name          = "alias/multi-tenant-key"
  target_key_id = aws_kms_key.app_kms.key_id
}

resource "aws_s3_bucket" "tenant_assets" {
  bucket = "multi-tenant-assets-${var.environment}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encryption" {
  bucket = aws_s3_bucket.tenant_assets.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.app_kms.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket                  = aws_s3_bucket.tenant_assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
