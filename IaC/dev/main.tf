# Backend configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>4.9"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.0"
    }
  }

#   backend "s3" {
#     bucket         = "state-bucket-trm"
#     key            = lower(local.naming_prefix)
#     region         = "eu-west-1"
#     dynamodb_table = "state-lock-db-trm"
#   }
}

# Provider configuration
provider "aws" {
  region = var.aws_regions[0]
}


module "s3-bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.14.0"

  bucket                   = var.backend_bucket
  force_destroy            = false
  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"
  tags                     = local.common_tags

  versioning = {
    enabled = true

  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

}

module "dynamodb-table" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "3.3.0"

  name         = var.backend_dynamodb_table
  hash_key     = "LockID"
  billing_mode = "PAY_PER_REQUEST"

  attributes = [
    { name : "LockID", type : "S" }
  ]

}

# Module configuration
module "frontend" {
  source = "./frontend"
}

module "backend" {
  source = "./backend"
}

module "sensor" {
  source = "./sensor"

  #Variables that has to be delivered to child module.
  company       = var.company
  project       = var.project
  naming_prefix = var.naming_prefix
}