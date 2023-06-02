import boto3
import json


def lambda_handler(event, context):
    # Retrieve Data from DB
    table_name = event['table']
    key = event['key']

    print(key)

    try:
        # Create a DynamoDB client
        dynamo = boto3.client('dynamodb')

        # Retrieve the item from DynamoDB
        response = dynamo.get_item(
            TableName=table_name,
            Key=key
        )

        # Check if item exists
        if 'Item' in response:
            item = response['Item']
            for attribute_name, attribute_value in item.items():
                print(f'{attribute_name}: {attribute_value}')
        else:
            print('Item not found')

    except Exception as e:
        print(f'Error: {str(e)}')
