//Libraries
#include <Arduino.h>
#include <time.h>
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
#define AWS_IOT_PUBLISH_TOPIC "esp32/pub" //Add to Subscribe topic on AWS
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub" //Add to Publish Topic on AWS

//Variables
unsigned long lastMillis = 0;


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


// Get current date/time, format is YYYY-MM-DD.HH:mm:ss
const std::string currentDateTime() {
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org", "time.nist.gov");
  time_t     now = time(0);
  struct tm  tstruct;
  gmtime_r   (&now, &tstruct);
  char       buff[80];
  //tstruct = *localtime(&now);

  strftime(buff, sizeof(buff), "%Y-%m-%d.%X", &tstruct);
  //Serial.println(asctime(&tstruct));

  return buff;
}


/**
 * Sends data from ESP32 to AWS every 10 secs
*/
void publishAuto(void)
{
    StaticJsonDocument<200> doc;
    doc[currentDateTime()] = String(reMap(analogRead(LRD)));
    //Handle JSON and Send to Client
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer); 
    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);

}

/**
 * Sends data from ESP32 to AWS
*/
void publishPerRequest(String sensorCommand)
{
  if(sensorCommand == "1")
  {
    StaticJsonDocument<200> doc;
    doc[currentDateTime()] = String(reMap(analogRead(LRD)));
    //Handle JSON and Send to Client
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer); 
    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
  }
  else
  {
    Serial.println("Not defined Command!");
  }
  //ADD IF MORE COMMANDS NEEDS TOBE HANDLED
}


/**
 * Receive Data from AWS to ESP32
*/
void receiveMessage(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received Topic Name: [");
  Serial.print(topic);
  Serial.print("]: ");

  StaticJsonDocument<200> doc;
  deserializeJson(doc,payload);
  String receivedSensorCommand = doc["Sensor Command"];
  
  //Give sensor command to do something
  if(receivedSensorCommand == "1")
  {
    Serial.println(reMap(analogRead(LRD)));
    publishPerRequest(receivedSensorCommand);
  }
  else
  {
    Serial.print("Undefined sensor command has been received!");
  }
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
  client.setCallback(receiveMessage);

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
  delay(5000);
  connectToAWS();
}



void loop() {

client.loop();

if (millis() - lastMillis > 10000)
{
  lastMillis = millis();
  publishAuto();
}


}

