import boto3
import variables

# load the ses client
client = boto3.client('ses')


def sendEmail(body_message, employeeID):


    email_response = client.send_email(
        Source=variables.FROM_ADDRESS,
        Destination={
            'ToAddresses':
                [
                    employeeID
                ]

        },
        Message={
            'Subject': {
                'Data': variables.SUBJECT
            },
            'Body': {
                'Text': {
                    'Data': body_message

                }
            }

        }
    )
    return email_response