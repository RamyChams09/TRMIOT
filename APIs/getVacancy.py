import boto3
import json
# import variabl

from formatRoom import formatRoom
# from getCurrentDate import dateFormat


# Todo: Expand to meet requirements!!!!
def lambda_handler(event, context):
    """
    Function to retrieve item from DynamoDB
    :param event: The event passed to the Lambda function
    :param context: The runtime information of the Lambda function
    :return: None
    :raises: Exception: If DynamoDB returns an error

    """

    # Get the table name and key from the event data
    booking_date_V = event['booking_date']
    #   booking_date_V = dateFormat()

    # Create a DynamoDB client
    dynamodb = boto3.client('dynamodb')
    table = 'TRM_MeetingRoom_Booking'

    try:
        filter_expression = '#booking_date = :booking_date'
        expression_attribute_names = {'#booking_date': 'booking_date'}
        expression_attribute_values = {':booking_date': {'S': booking_date_V}}

        # Retrieve the item from DynamoDB
        response = dynamodb.scan(
            TableName=table,
            FilterExpression=filter_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values
        )

        meetingroom_data = []

        for item in response['Items']:
            meetingroomID = item['meetingroomID']['S']
            meetingroom_data.append(item)

        return formatRoom(meetingroom_data)

    except Exception as e:
        print(f'Error: {str(e)}')
