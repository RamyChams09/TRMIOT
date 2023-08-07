import json

import boto3

import variables
from changeDateFormat import changeDateFormat
from returnMessage import create_response
from sendEmail import sendEmail


def lambda_handler(event, context):
    if 'requestContext' not in event or 'body' not in event:
        return create_response(400, 'Missing parameters in request.')
    userEmail = event.get('requestContext', {})
    body = json.loads(event.get('body', {}))
    # TODO check if data is retrieveable

    if 'booking_code' not in body or not body["booking_code"] or 'booking_date' not in body or not body[
        "booking_date"] or 'authorizer' not in userEmail:
        return create_response(400, 'Missing parameters in body.')

    # Receive DELETE data from the API
    booking_date = changeDateFormat(body['booking_date'])
    booking_code = body['booking_code']
    employeeID = userEmail['authorizer']['claims']['email']
    admin_check = ""

    body_message = f"""{variables.BODY}
    \tBooking code:\t {booking_code}
    \tBooking date:\t {booking_date}
    \tStatus:\t Cancelled
    Your booking has been cancelled successfully
    Kind regards,
    your booking team"""

    # load the DynamoDB client
    dynamodb = boto3.client("dynamodb")
    #  table_name = dynamodb.Table("TRM_MeetingRoom_Booking")

    try:
        response = dynamodb.get_item(
            TableName="UserList",
            Key={
                'User Name': {'S': employeeID}
            }
        )
        if 'Item' in response:
            admin_check = response['Item']['Admin']['S']

    except Exception as e:
        return create_response(500, f'Error: {str(e)}')

    try:
        response = dynamodb.get_item(
            TableName="TRM_MeetingRoom_Booking",
            Key={
                'booking_code': {'S': booking_code},
                'booking_date': {'S': booking_date}
            }
        )
        booking_owner = response['Item']['employeeID']['S']
        if ('Item' in response and booking_owner == employeeID) or admin_check == 'True':
            response = dynamodb.delete_item(
                TableName="TRM_MeetingRoom_Booking",
                Key={
                    'booking_code': {'S': booking_code},
                    'booking_date': {'S': booking_date}
                }
            )
            email_response = sendEmail(body_message, booking_owner)
            print(create_response(200, 'Booking has been deleted and email sent.'))
            return create_response(200, 'Booking has been deleted and email sent.')
        else:
            print(create_response(400, 'Booking not found or you are not authorized to delete this booking'))
            return create_response(400, 'Booking not found or you are not authorized to delete this booking.')

    except Exception as e:
        print(create_response(500, f'Error: {str(e)}'))
        return create_response(500, f'Error: {str(e)}')

