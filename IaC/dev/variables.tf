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

variable "aws_regions" {
  type        = list(string)
  description = "AWS Regions for AWS Resources"
  default     = ["eu-west-1"] #Add new regions if needed.
  sensitive   = false
}

variable "vpc_cidr_block" {
  type        = map(string)
  description = "Base CIDR Block for VPC"
}

variable "vpc_subnet_count" {
  type        = map(number)
  description = "Number of Subnets to create in VPC"
}

