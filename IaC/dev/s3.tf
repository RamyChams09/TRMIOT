module "s3-bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.14.0"

  bucket        = local.s3_bucket_name
  force_destroy = true
  tags          = local.common_tags
  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"
  

  #ATTENTION! - MAKE SURE PRINCIPAL-AWS IS WORKING!!
  policy = <<POLICY
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "*" 
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::${local.s3_bucket_name}",
                "arn:aws:s3:::${local.s3_bucket_name}/*"
            ]
        }
    ]
  }
    POLICY
}