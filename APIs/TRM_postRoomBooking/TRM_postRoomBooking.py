import json
import boto3
import pytz

import variables

from bookingCodeGen import bookingCodeGen
from changeDateFormat import changeDateFormat
from sendEmail import sendEmail
from validateBooking import validateBooking
from checkBookedEntry import checkBookedEntry
from returnMessage import create_response

# load the client
dynamodb = boto3.resource("dynamodb")


def lambda_handler(event, context):
    print(event)

    if 'requestContext' not in event or 'body' not in event:
        return create_response(400, 'Missing parameters in request.')

    userEmail = event.get('requestContext', {})
    body = json.loads(event.get('body', {}))

    if 'booking_date' not in body or not body["booking_date"] or \
            'authorizer' not in userEmail \
            or 'start_time' not in body or not body['start_time'] \
            or 'end_time' not in body or not body['end_time']:
        return create_response(400, 'Missing parameters in body.')

    # Receive the Post Data from the API

    meetingroomID = body["meetingroomID"]
    booking_date = changeDateFormat(body['booking_date'])
    start_time = body['start_time']
    end_time = body['end_time']
    booking_code = bookingCodeGen()
    employeeID = userEmail['authorizer']['claims']['email']
    print(employeeID)

    # Receive the email Attributes from the API

    body_message = f"""{variables.BODY}
    \tMeeting room:\t {meetingroomID}
    \tDate:\t {booking_date}
    \tStart time:\t {start_time}
    \tEnd time:\t {end_time}
    \tBooking code:\t {booking_code}

    To edit or cancel this booking, please click the following link: https://main.d35lzxz9bwsib4.amplifyapp.com/HTML/roombooking.html?#

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
                    email_response = sendEmail(body_message, employeeID)
                    return create_response(200, 'New booking made and email sent.')

                else:
                    return create_response(400, 'data failed to post')

            except Exception as e:
                return create_response(500, f'Error: {str(e)}')

        return create_response(400, 'This booking clashes with existing booking.')

    else:
        return create_response(400, 'Unable to create booking, please check booking details.')
