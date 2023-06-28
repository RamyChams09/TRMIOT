import boto3
import variables

def sendEmail(body_message, employeeID):
    # Receive the email Attributes from the API
    # to_address = 'ramy.chamseddin-el-saghir@capgemini.com'

    # load the ses client
    client = boto3.client('ses')

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