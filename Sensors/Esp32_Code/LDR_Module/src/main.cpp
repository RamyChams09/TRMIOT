//Libraries
#include <Arduino.h>
#include <time.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <vector>
#include <fstream>
#include <iostream>
#include <string.h>

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
std::vector<int> sensorValues;

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


/**
* Reads the content of the file.
*/
const char* readTextFile(const std::string& filePath) {
    std::ifstream file(filePath);
    if (!file) {
        std::cerr << "Failed to open file: " << filePath << std::endl;
        return nullptr;
    }

    std::string content((std::istreambuf_iterator<char>(file)),
                        std::istreambuf_iterator<char>());

    // Allocate memory for the content of the file
    char* fileContent = new char[content.length() + 1];
    strcpy(fileContent, content.c_str());

    return fileContent;
}

/**
* Converts readed content into useableform.
*/
static const char* convertToStaticConstChar(const char* fileContent) {
    static const char convertedContent[] PROGMEM = "";
    strcpy(const_cast<char*>(convertedContent), fileContent);
    return convertedContent;
}


/**
* Inserts key or certificate to necessary functions
*/
static const char* insertCertificate(const std::string& filePath)
{
  const char* fileContent = readTextFile(filePath);
  
  if(fileContent != nullptr)
  {
    auto convertedContent = convertToStaticConstChar(fileContent);
    delete[] fileContent;
    return convertedContent;
  }
  return "No Content found!";
}


/**
* Get current date/time, format is HH:mm:ss
* First default value is 02.00.00. When you use this function, you have to handle default value.
*/
const std::string getCurrentTime() 
{
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org");
  time_t     now = time(nullptr);
  struct tm  tstruct;
  char       buff[80];
  tstruct = *localtime(&now);

  strftime(buff, sizeof(buff), "%X", &tstruct);
  return buff;
}



/**
* Get current date/time, format is YYYY-MM-DD
* First default value is 1970-01-01. When you use this function, you have to handle default value.
*/
const std::string getCurrentDate() 
{
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org");
  time_t     now = time(nullptr);
  struct tm  tstruct;
  char       buff[80];
  tstruct = *localtime(&now);

  strftime(buff, sizeof(buff), "%Y-%m-%d", &tstruct);

  return buff;
}




/**
* Return the unique CHIP-ID of ESP32
*/
String getDeviceId()
{
  char ssid[30];
  
  uint64_t chipid = ESP.getEfuseMac(); // The chip ID is essentially its MAC address(length: 6 bytes).
  uint16_t chip = (uint16_t)(chipid >> 32);

  snprintf(ssid, sizeof(ssid), "TRM-%04X%08X", chip, (uint32_t)chipid);

  return ssid;
}




/**
* Sends data from ESP32 to AWS
*/
void publish(void)
{
  StaticJsonDocument<200> doc;
  doc["DeviceID:"] = getDeviceId();
  doc["Date:"] = getCurrentDate();
  doc["Time:"] = getCurrentTime();
  doc["LRD Average Sensor Value:"] = "";
  //doc["Requested LRD Sensor Value:"] = "";

  if(doc["Date/Time:"] == "1970-01-01")
    return;

  //Handle JSON and Send to Client
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); 
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);

}



/**
* Saves the sensor values into a vector.
* This function publishes average sensor value of last 6 sensor values.
* Since sensor sends every 10 seconds its value, average value will be sent every 1 min.
*/
void publishAverage(int value)
{
  if(sensorValues.size() == 6)
  {
    int sum {0};
    for(auto sensorValue : sensorValues)
    {
      sum += sensorValue;
    }

    float averageValue = sum / 6;
    //Publish average value
    StaticJsonDocument<200> doc;
    doc["DeviceID:"] = getDeviceId();
    doc["Date:"] = getCurrentDate();
    doc["Time:"] = getCurrentTime();
    doc["LRD Average Sensor Value:"] = String(averageValue);
    //doc["Requested LRD Sensor Value:"] = "";

    if(doc["Date:"] == "1970-01-01")
      return;

    //Handle JSON and Send to Client
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer); 
    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
    //Reset Values
    sensorValues.clear();
    averageValue = 0;
  }
  else
    sensorValues.push_back(value);
}



/**
* Sends data from ESP32 to AWS when it is requested per command
*/
void publishPerRequest(String sensorCommand)
{
  if(sensorCommand == "1")
  {
    StaticJsonDocument<200> doc; 
    doc["DeviceID:"] = getDeviceId();
    doc["Date:"] = getCurrentDate();
    doc["Time:"] = getCurrentTime();
    doc["LRD Average Sensor Value:"] = "";
    //doc["Requested LRD Sensor Value:"] = String(reMap(analogRead(LRD)));

    if(doc["Date:"] == "1970-01-01")
      return;
    //Handle JSON and Send to Client
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer);
    client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
  }
  //ADD IF MORE COMMANDS NEEDS TOBE HANDLED
  else
  {
    Serial.println("Not defined Command!");
  }
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
  String receivedSensorCommand = doc["Sensor Command:"];
  
  //Give sensor command to do something
  if(receivedSensorCommand == "1")
  {
    Serial.println(reMap(analogRead(LRD)));
    //publishPerRequest(receivedSensorCommand);
    //ADD IF MORE COMMANDS NEEDS TOBE HANDLED
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

  //net.setCACert(insertCertificate(PATH_AWS_CERT_CA));
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



void setup() 
{
  Serial.begin(115200);
  connectToWiFi();
  delay(5000);
  connectToAWS();
}



void loop() 
{
  client.loop();

  if (millis() - lastMillis > 10000)
  {
    lastMillis = millis();
    publishAverage(reMap(analogRead(LRD)));
  }

}

