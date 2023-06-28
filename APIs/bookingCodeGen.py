import random
import string


def bookingCodeGen():
    TRM_constant = "TRM"
    letters = string.ascii_letters
    digits = string.digits
    sep = '-'

    random_letter_upper = random.choice(letters.upper())
    random_letter_lower = random.choice(letters.lower())
    random_digit = random.choice(digits)

    random_letters_upper = ''.join(random.choices(letters.upper(), k=3))
    random_letters_lower = ''.join(random.choices(letters.lower(), k=3))
    random_digits = ''.join(random.choices(digits, k=3))
    random_string = TRM_constant + sep + random_letter_upper + random_letter_lower + random_digit + random_letters_upper + random_letters_lower + random_digits

    return random_string