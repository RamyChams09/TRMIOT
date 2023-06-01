import json


def lambda_handler(event, context):
    empID = event['empID']
    password = event['password']

    # Your login logic here
    if empID == '12345' and password == 'password':
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Login successful'})
        }
    else:
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Invalid credentials'})
        }
