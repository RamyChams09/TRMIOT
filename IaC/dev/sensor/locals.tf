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

  naming_prefix         = "${var.naming_prefix}-${terraform.workspace}"
  s3_bucket_name        = lower("${local.naming_prefix}-${random_integer.rand.result}")
  lambda_name           = lower("${local.naming_prefix}-${random_integer.rand.result}")
  iot_thing_name        = lower("${local.naming_prefix}-${random_integer.rand.result}")
  iot_thing_policy_name = lower("${local.naming_prefix}-${random_integer.rand.result}")
  iot_topic_rule_name   = lower("${random_integer.rand.result}")
  iam_role_name         = lower("${local.naming_prefix}-${random_integer.rand.result}")
  iam_role_policy_name  = lower("${local.naming_prefix}-${random_integer.rand.result}")
}