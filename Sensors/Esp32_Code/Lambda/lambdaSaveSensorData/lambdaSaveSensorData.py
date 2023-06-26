import boto3
import pandas as pd
import io


def lambda_handler(event, context):
    # Extract the sensor values from the IoT event
    device_id = event['DeviceID:']
    datestamp = event['Date:']
    timestamp = event['Time:']
    avr_sensor_value = event["LRD Average Sensor Value:"]
    requested_sensor_value = event["Requested LRD Sensor Value:"]


    # Check if there is incorrect or missing event
    if 'DeviceID:' not in event or 'Date:' not in event or 'Time:' not in event or 'LRD Average Sensor Value:' not in event or 'Requested LRD Sensor Value:' not in event:
        return {
            "statusCode": 500,
            "body": "Incorrect or missing event data"
        }

    # Check if timestamp has default value
    if datestamp is "1970-01-01":
        return {
            "statusCode": 500,
            "body": "Default value of timestamp!"
        }
    
    # Create the S3 client
    s3 = boto3.client('s3')

    # Define the bucket name and folder names
    bucket_name = 'trmsensorbucket'
    folder_name = 'sensor-data'
    folder_name_device_1 = 'room_1'
    folder_name_device_2 = 'room_2'
    folder_name_device_unknown = "unknown_room_and_deviceID"


    #Check if the S3 bucket exists
    response = s3.list_buckets()
    buckets = [bucket['Name'] for bucket in response["Buckets"]]
    if bucket_name not in buckets:
        return {
            "statusCode": 500,
            "body": "S3 bucket does not exist"
        }

    # Check if the 'sensor-data' folder exists, if not, create it
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
    if 'Contents' not in response:
        s3.put_object(Bucket=bucket_name, Key=f'{folder_name}/')


    #Put device IDs in a map or list for easier lookup
    device_folder_map = {
        'TRM-208F281FB608': folder_name_device_1,
        'TRM-C89D291FB608': folder_name_device_2
        # Add other device IDs and corresponding folder names here
    }

    #Determine the folder to add based on the device ID
    folder_name_device = device_folder_map.get(device_id, folder_name_device_unknown)



    # Check if the device folder exists, if not, create it
    device_folder_key = f'{folder_name}/{folder_name_device}/'
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=device_folder_key)
    if 'Contents' not in response:
        s3.put_object(Bucket=bucket_name, Key=device_folder_key)


    # Define the file name within the respective folder
    file_name = f'{device_folder_key}{datestamp}.parquet'


    # Check if the file already exists in the folder
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=file_name)
    if 'Contents' in response:
        # File exists, retrieve existing data and append new data
        s3.download_file(bucket_name, file_name, "/tmp/{datestamp}.parquet")
        existing_data = pd.read_parquet("/tmp/{datestamp}.parquet")
        new_data = pd.DataFrame([{
            'DeviceID:': device_id,
            'Date:': datestamp,
            'Time:': timestamp,
            'LRD Average Sensor Value:': avr_sensor_value,
            'Requested LRD Sensor Value:': requested_sensor_value
            
        }])
        new_data = pd.concat([existing_data, new_data], ignore_index=True)

    else:
        # File doesn't exist, create new file with the data
        new_data = pd.DataFrame([{
            'DeviceID:': device_id,
            'Date:': datestamp,
            'Time:': timestamp,
            'LRD Average Sensor Value:': avr_sensor_value,
            'Requested LRD Sensor Value:': requested_sensor_value
        }])

    # Write the Parquet file 
    new_data.to_parquet("/tmp/{datestamp}.parquet", index=False)
   

    # Upload it to S3
    try:
        response = s3.upload_file("/tmp/{datestamp}.parquet", bucket_name, file_name)
    except Exception as e:
        print(e)

    return {
        'statusCode': 200,
        'body': 'Sensor data saved successfully'
    }
