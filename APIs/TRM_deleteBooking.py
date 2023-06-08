import json
import boto3


def lambda_handler(event, context):
    # Receive DELETE data from the API
    booking_code = event["booking_code"]

    # defining response email
    to_address = event["to_address"]
    subject = event["subject"]
    body = event["body"]
    from_address = event["from_address"]

    body_message = f"""{body}
    \tBooking code:\t {booking_code}
    \tSatus:\t Canceled

    You booking has been canceled successfully

    Kind regards,
    Your booking team"""

    # load the DynamoDB client
    dynamodb = boto3.resource("dynamodb")
    table_name = dynamodb.Table("TRM_MeetingRoom_Booking")

    # load the SES client
    client = boto3.client("ses")

    try:
        delete_response = table_name.delete_item(
            Key={
                'booking_code': booking_code
            }
        )

        if delete_response['ResponseMetadata']['HTTPStatusCode'] == 200:
            email_response = client.send_email(
                Source=from_address,
                Destination={
                    'ToAddresses':
                        [
                            to_address
                        ]
                },
                Message={
                    'Subject': {
                        'Data': subject
                    },
                    'Body': {
                        'Text': {
                            'Data': body_message
                        }
                    }
                }
            )

            return {
                "status": 200,
                "delete_body": json.dumps("data deleted successfully"),
                'email_body': json.dumps(email_response)
            }
        else:
            return {
                "status": 400,
                "body": json.dumps("data failed to delete")
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
