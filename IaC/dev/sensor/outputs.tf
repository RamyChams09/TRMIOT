#################################
#             IoT 
#################################
resource "local_file" "thing_name" {
  content  = aws_iot_thing.thing.name
  filename = "sensor/sensor_certificates/thing_name.txt"
}

output "thing_name" {
  value       = aws_iot_thing.thing.name
  description = "Representation of physical device in the cloud"

}
resource "local_file" "cert" {
  content  = tls_self_signed_cert.cert.cert_pem
  filename = "sensor/sensor_certificates/cert.txt"
}

output "cert" {
  value       = tls_self_signed_cert.cert.cert_pem
  description = "Certification and identification of Client App"

}

resource "local_sensitive_file" "key" {
  content  = tls_private_key.key.private_key_pem
  filename = "sensor/sensor_certificates/key.txt"
}

output "key" {
  value       = tls_private_key.key.private_key_pem
  sensitive   = true
  description = "Private key for sensor communication"
}

resource "local_file" "iot_endpoint" {
  content  = data.aws_iot_endpoint.iot_endpoint.endpoint_address
  filename = "sensor/sensor_certificates/iot_endpoint.txt"
}

output "iot_endpoint" {
  value       = data.aws_iot_endpoint.iot_endpoint.endpoint_address
  description = "IoT Endpoint that Sensors will connect"

}

resource "local_file" "ca" {
  content  = data.http.root_ca.response_body
  filename = "sensor/sensor_certificates/ca.txt"
}

output "ca" {
  value       = data.http.root_ca.response_body
  description = "Certificate to trust from IoT Endpoint"

}

#######################################
#       BUCKET
#######################################
output "s3_bucket_name" {
  value       = module.s3-bucket.s3_bucket_id
  description = "Name of S3 Bucket"
}