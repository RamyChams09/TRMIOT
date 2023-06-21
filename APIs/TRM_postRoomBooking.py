import json
import boto3
import pytz

import variables

from bookingCodeGen import bookingCodeGen
from changeDateFormat import changeDateFormat
from sendEmail import sendEmail
from validateBooking import validateBooking
from checkBookedEntry import checkBookedEntry

# load the client
dynamodb = boto3.resource("dynamodb")


def lambda_handler(event, context):
    # Receive the Post Data from the API
    meetingroomID = event["meetingroomID"]
    booking_date = changeDateFormat(event["booking_date"])
    start_time = event["start_time"]
    end_time = event["end_time"]
    booking_code = bookingCodeGen()
    employeeID = event["employeeID"]

    # Receive the email Attributes from the API
    to_address = 'stephen.aliemeke@capgemini.com'

    body_message = f"""{variables.BODY}
    \tMeeting room:\t {meetingroomID}
    \tDate:\t {booking_date}
    \tStart time:\t {start_time}
    \tEnd time:\t {end_time}
    \tBooking code:\t {booking_code}

    To edit or cancel this booking, please click the following link: https://example.com

    Kind regards
    Your booking team"""

    table = dynamodb.Table("TRM_MeetingRoom_Booking")

    # validate Post Data
    if validateBooking(booking_date, start_time, end_time):
        if checkBookedEntry(meetingroomID, booking_date, start_time, end_time):
            try:
                post_response = table.put_item(
                    Item={
                        "meetingroomID": meetingroomID,
                        "booking_date": booking_date,
                        "start_time": start_time,
                        "end_time": end_time,
                        "booking_code": booking_code,
                        "employeeID": employeeID
                    }
                )

                if post_response['ResponseMetadata']['HTTPStatusCode'] == 200:
                    email_response = sendEmail(body_message)

                    return {
                        "status": 200,
                        "post_body": json.dumps("data posted successfully"),
                        'email_body': json.dumps(email_response)
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
        return {
            'statusCode': 400,
            'body': 'This booking clashes with existing booking.'
        }
    else:
        return {
            'statusCode': 400,
            'body': 'Booking date and time must not be less than the current date and time.'
        }
