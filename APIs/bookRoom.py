import json
import boto3


def lambda_handler(event, context):
    # incomingData = json.loads(event['body'])
    meetingroomID = event["meetingroomID"]
    Floor = event["Floor"]
    Location = event["Location"]
    Unit = event["Unit"]
    Booked = event["Booked"]

    print(meetingroomID)

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("TRM-Meetingroom")

    response = table.put_item(
        Item={
            "meetingroomID": meetingroomID,
            "Floor": Floor,
            "Location": Location,
            "Unit": Unit,
            "Booked": Booked
        }
    )

    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        return {
            "status": 200,
            "body": json.dumps("data posted successfully")
        }
    else:
        return {
            "status": 500,
            "body": json.dumps("data failed to post")
        }