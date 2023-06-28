import json


def formatRoom(response_data, current_employee_id):
    output = {}

    for item in response_data:
        if current_employee_id == item['employeeID']['S']:
            booked_by_me = True
        else:
            booked_by_me = False

        meetingroomID = item['booking_date']['S']
        booked_by = item['employeeID']['S']
        response = {
            'room_ID': item['meetingroomID']['S'],
            'start_time': item['start_time']['S'],
            'end_time': item['end_time']['S'],
            'book_code': item['booking_code']['S'],
            'booked_by_me': booked_by_me
        }

        if meetingroomID in output:
            output[meetingroomID].append(response)
        else:
            output[meetingroomID] = [response]

    print(json.dumps(output, indent=2))
    return json.dumps(output, indent=2)  # , default=bool)