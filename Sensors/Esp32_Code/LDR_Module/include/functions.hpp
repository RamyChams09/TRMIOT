//CONSTANTS
#define MIN_ANALOG_VALUE 0
#define MAX_ANALOG_VALUE 4095
#define MIN_MAPPED_VALUE 0
#define MAX_MAPPED_VALUE 10 //Change if needed

//Define functions

/**
Re-Map the value of 12-bit Analog Input Value while maintaining the ratio
Using Simple Linear Conversion Algorithm
0 -> lighter
10 -> less lighter

@param red Analog value
@return mapped value
*/
int  reMap(int analogValue)
{
    int oldRange = MAX_ANALOG_VALUE - MIN_ANALOG_VALUE;
    int newRange = MAX_MAPPED_VALUE - MIN_MAPPED_VALUE;

    int newAnalogValue = (((analogValue - MIN_ANALOG_VALUE) * newRange) / oldRange) +  MIN_MAPPED_VALUE;

    return newAnalogValue;
}


