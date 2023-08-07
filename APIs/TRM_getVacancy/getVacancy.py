import boto3

from formatRoom import formatRoom
from returnMessage import create_response


# import variable


def lambda_handler(event, context):
    print(event)
    """
    Function to retrieve item from DynamoDB
    :param event: The event passed to the Lambda function
    :param context: The runtime information of the Lambda function
    :return: None
    :raises: Exception: If DynamoDB returns an error

    """

    # Create a DynamoDB client
    dynamodb = boto3.client('dynamodb')
    table = 'TRM_MeetingRoom_Booking'

    # Get the employee ID of the booking creator (assuming it's passed in the event data)
    userEmail = event.get('requestContext', {})
    employeeID = userEmail['authorizer']['claims']['email']
    print(employeeID)

    try:
        response = dynamodb.get_item(TableName="UserList",
                                     Key={
                                         'User Name': {'S': employeeID}
                                     }
                                     )
        Admin_status = response['Item']['Admin']['S']
        print(Admin_status)
        if Admin_status == 'True':
            user_status = f"{employeeID} [Admin]"
        elif Admin_status == 'False':
            user_status = f"{employeeID}"
        else:
            print('wrong')
            user_status = f"{employeeID} [EXT]"
        print(user_status)
    except Exception as e:
        return create_response(500, f'Error: {str(e)}')
    try:
        # Retrieve the items from DynamoDB
        response = dynamodb.scan(TableName=table)
        items = response['Items']
        print(items)

        meetingroom_data = []

        for item in items:
            meetingroom_data.append(item)

        # Format the data and pass the employee ID
        response = formatRoom(meetingroom_data, employeeID, user_status, Admin_status)
        return create_response(200, response)

    except Exception as e:
        return create_response(500, f'Error: {str(e)}')
