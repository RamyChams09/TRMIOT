variable "backend_bucket" {
  description = "The S3 bucket to store Terraform state."
  type        = string
}

/*variable "backend_key" {
  description = "The key to identify the Terraform state file."
  type        = string
}

variable "backend_region" {
  description = "The AWS region where the backend S3 bucket exists."
  type        = string
}*/

variable "backend_dynamodb_table" {
  description = "The DynamoDB table used for locking state."
  type        = string
}

variable "aws_regions" {
  type        = list(string)
  description = "AWS Regions for AWS Resources"
  default     = ["eu-west-1"] #Add new regions if needed.
  sensitive   = false
}

variable "company" {
  type        = string
  description = "Company name for resource tagging"
  default     = "TechRetMars"
}

variable "project" {
  type        = string
  description = "Project name for resource tagging"
}

variable "naming_prefix" {
  type        = string
  description = "Naming prefix for resources"
}