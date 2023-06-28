import boto3
import json
# import variable

from formatRoom import formatRoom
from returnMessage import create_response


# from getCurrentDate import dateFormat


# Todo: Expand to meet requirements!!!!
def lambda_handler(event, context):
    print(event)
    """
    Function to retrieve item from DynamoDB
    :param event: The event passed to the Lambda function
    :param context: The runtime information of the Lambda function
    :return: None
    :raises: Exception: If DynamoDB returns an error

    """

    # Get the table name and key from the event data
    # booking_date_V = event['booking_date']
    #   booking_date_V = dateFormat()

    # Create a DynamoDB client
    dynamodb = boto3.client('dynamodb')
    table = 'TRM_MeetingRoom_Booking'

    # Get the employee ID of the booking creator (assuming it's passed in the event data)
    userEmail = event.get('requestContext', {})
    employeeID = userEmail['authorizer']['claims']['email']
    print(employeeID)

    try:
        # Retrieve the items from DynamoDB
        response = dynamodb.scan(TableName=table)
        items = response['Items']
        print(items)

        meetingroom_data = []

        for item in items:
            meetingroom_data.append(item)

        # Format the data and pass the employee ID
        response = formatRoom(meetingroom_data, employeeID)
        return create_response(200, response)

    except Exception as e:
        print(500, f'Error: {str(e)}')
