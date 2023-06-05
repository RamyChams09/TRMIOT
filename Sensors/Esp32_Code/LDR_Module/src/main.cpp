//Libraries
#include <Arduino.h>
#include <functions.hpp>

//Define PINS
#define LRD 32



void setup() {
  Serial.begin(115200);
 
}

void loop() {

Serial.println(reMap(analogRead(LRD)));
delay(1000);

}

