import json

def create_response(status, response_data):
    response = {
        'statusCode': status,
        'headers': {
            "Access-Control-Allow-Headers": '*',
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Methods": '*'
        },
        'body': json.dumps(response_data)
    }
    print(response)
    return response