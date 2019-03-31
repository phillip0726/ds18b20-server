#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>


#define myPeriodic 60 //in sec | Thingspeak pub is 15sec
#define ONE_WIRE_BUS 2  // DS18B20 on arduino pin2 corresponds to D4 on physical board
int flag=0;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
float prevTemp = 0;
const long gmtOffset_sec=32400;
const char* server = "api.thingspeak.com";
const char* myserver="3.18.107.250";
String apiKey ="IDN9I9J9ONMRDO7M";
const char* MY_SSID = "iptime"; 
const char* MY_PWD = "";

int sent = 0;
void setup() {
  Serial.begin(115200);
  connectWifi();
}

void loop() {
  float temp;

  if(flag%2 == 0)
  {
     DS18B20.requestTemperatures(); 
     temp = DS18B20.getTempCByIndex(0);

     Serial.print(String(sent)+" Temperature: ");
     Serial.println(temp);
     sendTeperatureTS(temp);
  }
  else
  {
    DS18B20.requestTemperatures(); 
    temp = DS18B20.getTempCByIndex(0);
    Serial.print("connecting to ");
    Serial.println(myserver);
    sendTeperatureUBT(temp);
  }
}

void connectWifi()
{
  Serial.print("Connecting to "+*MY_SSID);
  WiFi.begin(MY_SSID, MY_PWD);
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Connected");
  Serial.println("");  
}//end connect
void sendTeperatureUBT(float temp){
  WiFiClient client;
  const int httpPort=3000;
  if(!client.connect(myserver,httpPort)){
    Serial.println("connection failed");
    return;
  }

  String url="/";
  url+="push";
  url+="?id=MyRoom";
  url+="&temp=";
  url+=temp;
  Serial.print("Requesting URL: ");
  Serial.println(url);
  client.print(String("GET ") + url+" HTTP/1.1\r\n"+"Host: "+myserver+"\r\n"+"Connection: close\r\n\r\n");
  while(client.available())
  {
    String line=client.readStringUntil('\r');
    Serial.print(line);
  }
  Serial.println();
  Serial.println("closing connection");
  
  int count = myPeriodic;
  flag++;
  while(count--)
  delay(1000);
}
void sendTeperatureTS(float temp)
{  
  WiFiClient client;
  
  if (client.connect(server, 80)) { // use ip 184.106.153.149 or api.thingspeak.com
  Serial.println("WiFi Client connected ");
   
  String postStr = apiKey;
  postStr += "&field1=";
  postStr += String(temp);
  postStr += "\r\n\r\n";
   
  client.print("POST /update HTTP/1.1\n");
  client.print("Host: api.thingspeak.com\n");
  client.print("Connection: close\n");
  client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
  client.print("Content-Type: application/x-www-form-urlencoded\n");
  client.print("Content-Length: ");
  client.print(postStr.length());
  client.print("\n\n");
  client.print(postStr);
  int count = myPeriodic;
  flag++;
  while(count--)
  delay(1000); 
  }//end if
  sent++;
  client.stop();
}//end send
