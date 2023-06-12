//Libraries
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>


#include "secrets.hpp"

//Define PINS
#define LRD 32
//Define 12-Bit ANALOG READ
#define MIN_ANALOG_VALUE 300
#define MAX_ANALOG_VALUE 4095
#define MIN_MAPPED_VALUE 0
#define MAX_MAPPED_VALUE 10 //Change if needed
//WIFI Settings
#define WIFI_TIMEOUT_MS 20000
//AWS Related
#define AWS_IOT_PUBLISH_TOPIC "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub"
#define AWS_IOT_RECEIVE_TOPIC "esp32/rec"



//Instances
WiFiClientSecure net;
PubSubClient client(net);


 
/**
*Re-Map the value of 12-bit Analog Input Value while maintaining the ratio
*Using Simple Linear Conversion Algorithm
*0 -> lighter
*10 -> less lighter

*@param red Analog value
*@return mapped value
*/
int  reMap(int analogValue)
{
    int oldRange = MAX_ANALOG_VALUE - MIN_ANALOG_VALUE;
    int newRange = MAX_MAPPED_VALUE - MIN_MAPPED_VALUE;

    int newAnalogValue = (((analogValue - MIN_ANALOG_VALUE) * newRange) / oldRange) +  MIN_MAPPED_VALUE;

    return newAnalogValue;
}

void messageReceived(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");

  StaticJsonDocument<200> doc;
  deserializeJson(doc,payload);
  String relay1 = doc["status"];
  int r1 = relay1.toInt();
  if(r1 == 1)
    Serial.print("Working!");
  //TODO ADD IF STATEMENTS

  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

/**
 * Connects to the WIFI
*/
void connectToWiFi()
{
    Serial.println("Connecting to WiFi...");
    WiFi.mode(WIFI_STA); //Lets you use existing WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD); //Starts connection

    unsigned long startAttemptTime = millis(); //Returns how much time has passed since the board executed.

    while(WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < WIFI_TIMEOUT_MS)
    {
        Serial.print(".");
        delay(100);
    }

    if(WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Connection to WiFi is failed!");
        // We can add here if we want to re-try to connect WiFi.
    }
    else
    {
        Serial.print("Connected to: ");
        Serial.println(WiFi.localIP());
    }
}


void connectToAWS()
{
  //Configure WiFiClientSecure to use the AWS IOT device credentials

  if(WiFi.status() != WL_CONNECTED)
  {
    Serial.println("Failed! First, connect to a WiFi.");
    return;
  }

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);
  //Connect to the MQTT broker on the AWS endpoint we defined earlier
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  //Create a message handler
  client.setCallback(messageReceived);

  //Connection starts here
  Serial.println("Connecting to AWS IoT Core...");
  unsigned long startAttemptTime = millis();

  while(!client.connect(THINGNAME) && millis() - startAttemptTime < WIFI_TIMEOUT_MS)
  {
    Serial.print(".");
    delay(100);
  }
  if(!client.connected())
  {
    Serial.println("Connection to AWS IoT Core is failed!");
  }
  else
  {
    client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
    Serial.println("Connected to AWS IoT Core!");
  }
}


void setup() {
  Serial.begin(115200);
  connectToWiFi();
  delay(2000);
  connectToAWS();
}

void loop() {

client.loop();
//Serial.println(reMap(analogRead(LRD)));
delay(1000);

}

