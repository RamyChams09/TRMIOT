import datetime
import pytz


def validateBooking(booking_date_str, start_time_str, end_time_str):
    berlin_tz = pytz.timezone('Europe/Berlin')
    current_date = datetime.datetime.now(berlin_tz).date()
    current_time = datetime.datetime.now(berlin_tz).time()

    booking_date = datetime.datetime.strptime(booking_date_str, "%d-%m-%Y").date()
    start_time = datetime.datetime.strptime(start_time_str, "%H:%M").time()
    end_time = datetime.datetime.strptime(end_time_str, "%H:%M").time()

    if booking_date < current_date:
        print('booking_date is less than Current Date')
        return False
    if start_time < current_time:
        print('Start time is less than Current time')
        return False
    if start_time > end_time:
        print('Start time cannot be greater than end time')
        return False

    print('Booking is valid, no clashes in new booking')
    return True
