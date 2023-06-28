import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TRM_MeetingRoom_Booking")


def deleteOldEntry(booking_code, booking_date):
    response = table.scan(
        FilterExpression='booking_code = :booking_code AND booking_date = :booking_date',
        ExpressionAttributeValues={
            ':booking_code': booking_code,
            ':booking_date': booking_date
        }
    )

    if len(response['Items']) != 0:
        response = table.delete_item(
            # TableName="TRM_MeetingRoom_Booking",
            Key={
                'booking_code': booking_code,
                'booking_date': booking_date
                # 'booking_date': {'S': booking_date}
            }
        )
        return booking_code
    return False
