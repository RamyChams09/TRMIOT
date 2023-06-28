import json
import boto3

import variables


def lambda_handler(event, context):
    # Receive the Post Data from the API
    new_meetingroomID = event["meetingroomID"]
    new_date = event["booking_date"]
    new_start_time = event["start_time"]
    new_end_time = event["end_time"]
    booking_code = event["booking_code"]
    booking_date = event["booking_date"]

    # Receive the email Attributes from the API
    to_address = event["to_address"]

    body_message = f"""{variable.BODY}
    Your booking has been updated as below:
    \tMeetingroom: {new_meetingroomID}
    \tDate: {new_date}
    \tStart time: {new_start_time}
    \tEnd time: {new_end_time}
    \tBooking code: {booking_code}

    To edit or cancel this booking, please click the following link: https://example.com

    Kind regards
    Your booking team"""

    # load the clients
    dynamodb = boto3.client("dynamodb")
    client = boto3.client('ses')

    # if get:
    # TODO: write code...

    update_expression = 'SET meetingroomID = :mID, start_time = :st, end_time = :et, booking_date = :bd'

    exp_attribute_values = {
        ':mID': {'S': new_meetingroomID},
        ':st': {'S': new_start_time},
        ':et': {'S': new_end_time},
        ':bd': {'S': new_date}
    }

    try:
        update_response = dynamodb.update_item(
            TableName="TRM_MeetingRoom_Booking",
            Key={
                'booking_code': {'S': booking_code},
                'booking_date': {'S': booking_date}
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=exp_attribute_values,
        )

        if update_response['ResponseMetadata']['HTTPStatusCode'] == 200:
            email_response = client.send_email(
                Source=variable.FROM_ADDRESS,
                Destination={
                    'ToAddresses':
                        [
                            to_address
                        ]

                },
                Message={
                    'Subject': {
                        'Data': variable.SUBJECT
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
                "body": json.dumps("data updated successfully"),
                'body': json.dumps(email_response)
            }

        else:
            return {
                "status": 400,
                "body": json.dumps("data failed to update")
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
