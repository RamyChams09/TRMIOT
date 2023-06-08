import json
import boto3


def lambda_handler(event, context):
    # Receive the Post Data from the API
    meetingroomID = event["meetingroomID"]
    date = event["date"]
    start_time = event["start_time"]
    end_time = event["end_time"]
    booking_code = event["booking_code"]
    employeeID = event["employeeID"]

    # Receive the email Attributes from the API
    to_address = event["to_address"]
    subject = event['subject']
    body = event['body']
    from_address = event['from_address']

    body_message = f"""{body}
        \tMeeting room:\t {meetingroomID}
        \tDate:\t {date}
        \tStart time:\t {start_time}
        \tEnd time:\t {end_time}
        \tBooking code:\t {booking_code}

    To edit or cancel this booking, please click the following link: https://example.com

    Kind regards
    Your booking team"""

    # load the DynamoDB client
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("TRM_MeetingRoom_Booking")

    # load the ses client
    client = boto3.client('ses')

    try:
        post_response = table.put_item(
            Item={
                "meetingroomID": meetingroomID,
                "date": date,
                "start_time": start_time,
                "end_time": end_time,
                "booking_code": booking_code,
                "employeeID": employeeID
            }
        )

        if post_response['ResponseMetadata']['HTTPStatusCode'] == 200:
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
                "post_body": json.dumps("data posted successfully"),
                'delete_body': json.dumps(email_response)
            }

        else:
            return {
                "status": 400,
                "body": json.dumps("data failed to post")
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
