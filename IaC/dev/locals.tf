resource "random_integer" "rand" {
  min = 10000
  max = 99999

}

locals {
  common_tags = {
    company     = var.company
    project     = "${var.company}-${var.project}"
    environment = terraform.workspace
  }

  naming_prefix = "${var.naming_prefix}-${terraform.workspace}"
}