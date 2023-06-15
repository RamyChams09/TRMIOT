from datetime import datetime


def changeDateFormat(date_str):
    received_date = datetime.strptime(date_str, '%Y-%m-%d')
    formatted_date = received_date.strftime('%d-%m-%Y')

    return formatted_date