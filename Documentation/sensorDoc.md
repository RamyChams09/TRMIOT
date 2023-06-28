# Sensor documentation

## Cloud Settings - Region, Budget

- we defined the resource budget - AWS Console > Billing Dashboard > Budget
- we defined the region for implementation as per customer's request - Region > Frankfurt

## sensor platform
Platform.IO

Is a development platform for microcontrollers and sensors.

This can be integrated into VS Code

## AWS component definition

- as per customer's request, we selected the following AWS components: IoT Core, Lambda, S3 Bucket
  
- IoT Core – A service to connect IoT devices to AWS
- Lambda - an event-driven serverless computing platform
- S3 - Simple Storage Service


## Lambda definition

Lambda > create functions

- lambdaSaveSensorData > convert to .parquet file and save the Sensor Data in S3 Bucket
  
- Lambda function creates folders for the each rooms and create a sensor file for each days and saves the package file in the S3 bucket

# Architecture



# Dataflow

- Devices to AWS - the data runs from the sensor to AWS IoT Core - serves to connect the devices and the AWS services
- MQTT test client - to monitor the connection to AWS
- Lambda function - converts the data to .parquet format and passes it to the S3 bucket for storage
- S3 Bucket - for storing the received sensor data
