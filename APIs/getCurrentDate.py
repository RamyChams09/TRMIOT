import datetime
import pytz


def dateFormat():
    berlin_tz = pytz.timezone('Europe/Berlin')
    berlin_date = datetime.datetime.now(berlin_tz).date()
    return berlin_date.strftime('%d-%m-%Y')