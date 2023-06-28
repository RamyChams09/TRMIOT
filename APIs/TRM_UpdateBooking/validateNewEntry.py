import datetime
import pytz


def validateNewEntry(booking_date_str, start_time_str, end_time_str):
    berlin_tz = pytz.timezone('Europe/Berlin')
    current_datetime = datetime.datetime.now(berlin_tz)

    current_date = datetime.datetime.now(berlin_tz).date()
    current_time = datetime.datetime.now(berlin_tz).time()

    booking_date = datetime.datetime.strptime(booking_date_str, "%d-%m-%Y").date()
    start_time = datetime.datetime.strptime(start_time_str, "%H:%M").time()
    end_time = datetime.datetime.strptime(end_time_str, "%H:%M").time()

    current_datetime_combined = datetime.datetime.combine(current_datetime.date(), current_datetime.time())
    start_datetime_combined = datetime.datetime.combine(booking_date, start_time)

    print(current_datetime)

    if booking_date < current_date:
        print('booking_date is less than Current Date')
        return False
    if start_datetime_combined < current_datetime_combined:
        print('Start time is less than Current time')
        return False
    if start_time > end_time:
        print('Start time cannot be greater than end time')
        return False
    if (datetime.datetime.combine(datetime.date.today(), end_time) - datetime.datetime.combine(datetime.date.today(),
                                                                                               start_time)).seconds < 1800:
        print('Booking duration should be at least 30 minutes')
        return False

    print('Booking is valid, no clashes in new booking')
    return True
