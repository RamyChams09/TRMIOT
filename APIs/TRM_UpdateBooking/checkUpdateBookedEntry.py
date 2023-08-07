import boto3

dynamodb = boto3.resource('dynamodb')


def checkUpdateBookedEntry(meetingroomID, booking_date, start_time, end_time):
    table = dynamodb.Table("TRM_MeetingRoom_Booking")

    # check if bookinh already exists
    response = table.scan(
        FilterExpression='meetingroomID = :roomID AND booking_date = :bdate AND start_time = :startt AND end_time = :endt',
        ExpressionAttributeValues={
            ':roomID': meetingroomID,
            ':bdate': booking_date,
            ':startt': start_time,
            ':endt': end_time
        }
    )

    if response['Items']:
        return False

    response = table.scan(
        FilterExpression='meetingroomID = :roomID AND booking_date = :bdate AND ((start_time < :endt AND end_time > :startt) OR (start_time > :startt AND start_time < :endt))',
        ExpressionAttributeValues={
            ':roomID': meetingroomID,
            ':bdate': booking_date,
            ':startt': start_time,
            ':endt': end_time
        }
    )

    if response['Items']:
        return False

    return True
