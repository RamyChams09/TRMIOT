module "lambda" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "5.2.0"


  function_name = local.lambda_name
  description   = "Lambda function to save Sensor Data - Triggered by AWS IoT"
  handler       = "lambdaSaveSensorData.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30

  create_package         = false
  local_existing_package = "sensor/lambda_dependencies/packages.zip"
  publish                = true #True is necessary to create a trigger

  allowed_triggers = {
    IoT = {
      service    = "iot"
      source_arn = aws_iot_topic_rule.rule.arn
      action     = "lambda:InvokeFunction"
    }
  }

  attach_policy_json = true
  policy_json        = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListS3Buckets",
      "Effect": "Allow",
      "Action": "s3:ListAllMyBuckets",
      "Resource": "*"
    },
    {
      "Sid": "AccessSpecificS3Bucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": ["arn:aws:s3:::${module.s3-bucket.s3_bucket_id}",
      "arn:aws:s3:::${module.s3-bucket.s3_bucket_id}/*"
      ]
    }
  ]
}
EOF

  environment_variables = {
    BUCKET_NAME = module.s3-bucket.s3_bucket_id

  }

  tags = local.common_tags
}
