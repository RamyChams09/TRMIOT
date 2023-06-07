import json
import boto3


def lambda_handler(event, context):
    # incomingData = json.loads(event['body'])
    meetingroomID = event["meetingroomID"]
    date = event["date"]
    start_time = event["start_time"]
    end_time = event["end_time"]
    booking_code = event["booking_code"]

    # grab the to, from , subject and body
    to_address = event["to_address"]
    subject = event['subject']
    body = event['body']
    from_address = event['from_address']

    body_message = f"{body}\n\
    Meetingroom: {meetingroomID}\n\
    Date: {date}\n\
    Start time: {start_time}\n\
    End time: {end_time}\n\
    Booking code: {booking_code}\n \n\
to edit or cancel this booking please click here\n\n\
Kind regards\n Your booking team"

    print(meetingroomID)

    # load the DynamoDB client
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("TRM-Meetingroom")

    # load the ses client
    client = boto3.client('ses')

    response = table.put_item(
        Item={
            "meetingroomID": meetingroomID,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "booking_code": booking_code
        }
    )

    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        response = client.send_email(
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
            "body": json.dumps("data posted successfully"),
            'statusCode': 200,
            'body': json.dumps(response)
        }
    else:
        return {
            "status": 500,
            "body": json.dumps("data failed to post")
        }

