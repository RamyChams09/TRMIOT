#Create THING - Physical Device in the Cloud
resource "aws_iot_thing" "thing" {
  name = local.iot_thing_name

}

#Generate private key 
resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 2048

}

#Generate self-signed certificate using the key
resource "tls_self_signed_cert" "cert" {
  private_key_pem       = tls_private_key.key.private_key_pem
  validity_period_hours = 240
  allowed_uses          = []
  subject {
    organization = "TRM"
  }

}

#AWS needs to know about certificate, Terraform uploads
resource "aws_iot_certificate" "cert" {
  certificate_pem = trimspace(tls_self_signed_cert.cert.cert_pem)
  active          = true

}

#Allow connections to THING, a Certificate needs to be attached
resource "aws_iot_thing_principal_attachment" "attachment" {
  principal = aws_iot_certificate.cert.arn
  thing     = aws_iot_thing.thing.name

}


#Define IoT Policy - will be attached later to a certificate
resource "aws_iot_policy" "policy" {
  name = local.iot_thing_policy_name

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : "iot:Connect",
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : "iot:Publish",
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : "iot:Subscribe",
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : "iot:Receive",
        "Resource" : "*"
      }
    ]
  })


}
#Attach iot policy to a certificate
resource "aws_iot_policy_attachment" "attachment" {
  policy = aws_iot_policy.policy.name
  target = aws_iot_certificate.cert.arn
}


#Client needs to know where to connect. We use data source IoT Endpoint
data "aws_iot_endpoint" "iot_endpoint" {
  endpoint_type = "iot:Data-ATS" #ATS means Amazon Trust Services
}


#The client needs to know what certificate to trust from IoT Endpoint. Mutual TLS auth.
#Get Amazon`s CA Cert using http data source.
data "http" "root_ca" {
  url = "https://www.amazontrust.com/repository/AmazonRootCA1.pem"

}

#Incoming IoT Events(Datas) will trigger a lambda function.
resource "aws_iot_topic_rule" "rule" {
  name        = "rule_${local.iot_topic_rule_name}"
  sql         = "SELECT * FROM 'esp32/pub'"
  description = "Rule to trigger the Lambda Function"
  sql_version = "2016-03-23"
  enabled     = true

  lambda {
    function_arn = module.lambda.lambda_function_arn
  }

  tags = local.common_tags

}
