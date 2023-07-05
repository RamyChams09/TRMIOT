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
}

##################################
#       PROVIDERS
##################################
provider "aws" {
  region = var.aws_regions[0]

}