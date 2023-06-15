import json
import boto3

import variables

from sendEmail import sendEmail


def lambda_handler(event, context):
    # Receive DELETE data from the API
    booking_code = event["booking_code"]
    booking_date = event["booking_date"]

    body_message = f"""{variables.BODY}
    \tBooking code:\t {booking_code}
    \tBooking date:\t {booking_date}
    \tSatus:\t Canceled

    You booking has been canceled successfully

    Kind regards,
    Your booking team"""

    # load the DynamoDB client
    dynamodb = boto3.client("dynamodb")
    #  table_name = dynamodb.Table("TRM_MeetingRoom_Booking")

    print(booking_code)

    try:
        response = dynamodb.get_item(
            TableName="TRM_MeetingRoom_Booking",
            Key={
                'booking_code': {'S': booking_code},
                'booking_date': {'S': booking_date}
            }
        )
        if 'Item' in response:
            response = dynamodb.delete_item(
                TableName="TRM_MeetingRoom_Booking",
                Key={
                    'booking_code': {'S': booking_code},
                    'booking_date': {'S': booking_date}
                }
            )
            email_response = sendEmail(body_message)
            return {
                "status": 200,
                "delete_body": json.dumps("Booking deleted successfully"),
                'email_body': json.dumps(email_response)
            }
        else:
            return {
                "status": 400,
                "body": json.dumps("Booking not found")
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
