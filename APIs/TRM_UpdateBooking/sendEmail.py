import boto3

import variables

# load the ses client
client = boto3.client('ses')


def sendEmail(body_message, email_address):


    email_response = client.send_email(
        Source=variables.FROM_ADDRESS,
        Destination={
            'ToAddresses':
                [
                    email_address
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
    print(email_response)
    return email_response