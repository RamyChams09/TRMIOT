import json
import boto3


def lambda_handler(event, context):
    # Extract the sensor values from the IoT event
    device_id = event['DeviceID']
    timestamp = event['Date/Time:']
    sensor_value = event['LRD Sensor Value:']

    # Create the S3 client
    s3 = boto3.client('s3')

    # Define the bucket name and folder names
    bucket_name = 'trmsensorbucket'
    folder_name = 'sensor-data'
    folder_name_device_1 = 'room_1'
    folder_name_device_2 = 'room_2'

    # Check if the 'sensor-data' folder exists, if not, create it
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)

    if 'Contents' not in response:
        s3.put_object(Bucket=bucket_name, Key=f'{folder_name}/')

    # Determine the folder to add based on the device ID
    if device_id == 'TRM-208F281FB608':
        folder_name_device = folder_name_device_1
    else:
        folder_name_device = folder_name_device_2

    # Check if the device folder exists, if not, create it
    device_folder_key = f'{folder_name}/{folder_name_device}/'
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=device_folder_key)

    if 'Contents' not in response:
        s3.put_object(Bucket=bucket_name, Key=device_folder_key)

    # Define the file name within the respective folder
    file_name = f'{device_folder_key}sensor_data.json'

    # Check if the file already exists in the folder
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=file_name)

    if timestamp is "1970-01-01 / 02:00:10":
        return

    if 'Contents' in response:
        # File exists, retrieve existing data and append new data
        existing_object = s3.get_object(Bucket=bucket_name, Key=file_name)
        existing_data = json.loads(existing_object['Body'].read().decode('utf-8'))
        existing_data.append({
            'DeviceID': device_id,
            'Date/Time': timestamp,
            'LRD Sensor Value': sensor_value
        })
        new_data = json.dumps(existing_data, indent=2)
    else:
        # File doesn't exist, create new file with the data
        new_data = json.dumps([{
            'DeviceID': device_id,
            'Date/Time': timestamp,
            'LRD Sensor Value': sensor_value
        }])

    # Upload the JSON file to S3
    s3.put_object(Bucket=bucket_name, Key=file_name, Body=new_data)

    return {
        'statusCode': 200,
        'body': 'Sensor data saved successfully'
    }
