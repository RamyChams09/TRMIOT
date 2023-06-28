import json
import boto3

import variables
from validateNewEntry import validateNewEntry
from checkUpdateBookedEntry import checkUpdateBookedEntry
from deleteOldEntry import deleteOldEntry
from sendEmail import sendEmail
from returnMessage import create_response

# load the clients
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("TRM_MeetingRoom_Booking")

client = boto3.client('ses')


def lambda_handler(event, context):
    # Receive the Post Data from the API
    # meetingroomID = ["meetingroomID"]
    # start_time = ["start_time"]
    # end_time = ["end_time"]
    new_meetingroomID = event["new_meetingroomID"]
    new_date = event["new_date"]
    new_start_time = event["new_start_time"]
    new_end_time = event["new_end_time"]
    booking_code = event["booking_code"]
    employeeID = event["employeeID"]
    booking_date = event["booking_date"]

    # Receive the email Attributes from the API
    # to_address = event["to_address"]

    body_message = f"""{variables.BODY}
Your booking has been updated as below:\n
\tMeetingroom: {new_meetingroomID}
\tDate: {new_date}
\tStart time: {new_start_time}
\tEnd time: {new_end_time}
\tBooking code: {booking_code}

To edit or cancel this booking, please click the following link: https://main.d35lzxz9bwsib4.amplifyapp.com/

Kind regards
Your booking team"""

    # if get:
    # TODO: write code...

    if validateNewEntry(new_date, new_start_time, new_end_time):
        if checkUpdateBookedEntry(new_meetingroomID, new_date, new_start_time, new_end_time):
            if deleteOldEntry(booking_code, booking_date):
                try:
                    post_response = table.put_item(
                        Item={
                            "meetingroomID": new_meetingroomID,
                            "booking_date": new_date,
                            "start_time": new_start_time,
                            "end_time": new_end_time,
                            "booking_code": booking_code,
                            "employeeID": employeeID
                        }
                    )

                    if post_response['ResponseMetadata']['HTTPStatusCode'] == 200:
                        email_response = sendEmail(body_message)

                        print(create_response(200, 'Booking has been updated and email sent.'))
                        return create_response(200, 'Booking has been updated and email sent.')

                    else:
                        print(create_response(400, 'data failed to update.'))
                        return create_response(400, 'data failed to update.')

                except Exception as e:
                    print(create_response(500, f'Error: {str(e)}'))
                    return create_response(500, f'Error: {str(e)}')

            print(create_response(400, 'Booking not found, please enter a valid booking code.'))
            return create_response(400, 'Booking not found, please enter a valid booking code.')

        print(create_response(400, 'This booking clashes with existing booking.'))
        return create_response(400, 'This booking clashes with existing booking.')

    print(create_response(400, 'Unable to update booking, please check booking details.'))
    return create_response(400, 'Unable to update booking, please check booking details.')

