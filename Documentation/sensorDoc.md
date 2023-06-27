# Sensor documentation

## Cloud Settings - Region, Budget

- we defined the resource budget - AWS Console > Billing Dashboard > Budget
- we defined the region for implementation as per customer's request - Region > Frankfurt

## AWS component definition

- as per customer's request, we selected the following AWS components: Lambda, S3 Bucket, IoT Core

- Lambda - an event-driven serverless computing platform
- S3 - Simple Storage Service
- IoT Core – A service to connect IoT devices to AWS

## Lambda definition

Lambda > create functions

lambdaSaveSensorData > convert to .parquet file and safe the Sensor Data in S3 Bucket

# Architecture



# Dataflow

- Devises to AWS - the data runs from the sensor to AWS IoT Core - serves to connect the devices and the AWS services
- MQTT test client - to monitor the connection to AWS
- Lambda function - converts the data to .parquet format and passes it to the S3 bucket for storage
- S3 Bucket - for storing the received sensor data
