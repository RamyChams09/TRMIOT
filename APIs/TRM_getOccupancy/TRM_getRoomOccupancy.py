import boto3
import pyarrow.parquet as pq
import numpy as np
import pyarrow.fs as fs
import json

from returnMessage import create_response

s3_client = boto3.client('s3')


def lambda_handler(event, context):
    bucket_name = 'trmsensorbucket'
    param = event.get('queryStringParameters', {})

    if 'room_id' not in param or not param['room_id'] or 'date' not in param or not param['date']:
        response = {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid input. Please provide correct values'})
        }
        return response

    room_id = param['room_id']
    date = param['date']
    suffix = '.parquet'
    s3fs = fs.S3FileSystem()

    # Construct the S3 object key for the specific room and date
    s3_object_key = f"{bucket_name}/sensor-data/{room_id}/{date}{suffix}"

    try:
        # Read the Parquet file
        parquet_data = pq.ParquetDataset(s3_object_key, filesystem=s3fs).read()

        if len(parquet_data) > 0:
            columns = parquet_data.column_names
            output = {column: np.array(parquet_data[column]).tolist() for column in columns}
            time = output.get("Time:", [])
            occupancy = output.get("LRD Average Sensor Value:", [])
            occupancy_to_int = [int(float(x)) if x else 0 for x in occupancy]

            response = {
                'time': time,
                'occupancy': occupancy_to_int
            }
            return create_response(200, response)
        else:
            return create_response(404, 'no data was found.')

    except FileNotFoundError:
        return create_response(404, 'no data was found.')
    except Exception as e:
        return create_response(500, f'Error processing Parquet file: {str(e)}')