/*
 * AgentHub IoT Client - Arduino Example
 * ======================================
 *
 * This sketch demonstrates how to connect an Arduino with
 * Ethernet or WiFi shield to the AgentHub platform.
 *
 * Requirements:
 *   - Arduino Uno/Mega with Ethernet Shield or WiFi Shield
 *   - ArduinoJson library
 *   - ArduinoHttpClient library
 *
 * Wiring:
 *   - Analog temperature sensor (TMP36) on A0
 *   - Light sensor (photoresistor) on A1
 */

#include <SPI.h>
#include <Ethernet.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

// Network configuration
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

// AgentHub configuration - UPDATE THESE VALUES
const char SERVER_HOST[] = "your-agenthub-host.com";
const int SERVER_PORT = 443;
const char API_KEY[] = "dev_your_api_key_here";
const char DEVICE_ID[] = "your-device-uuid-here";

// Sensor pins
const int TEMP_PIN = A0;
const int LIGHT_PIN = A1;

// Timing
const unsigned long SEND_INTERVAL = 15000; // 15 seconds
unsigned long lastSendTime = 0;

EthernetClient ethClient;
HttpClient httpClient(ethClient, SERVER_HOST, SERVER_PORT);

void setup() {
  Serial.begin(9600);
  while (!Serial) { ; }

  Serial.println("AgentHub Arduino IoT Client");
  Serial.println("Initializing Ethernet...");

  if (Ethernet.begin(mac) == 0) {
    Serial.println("DHCP failed, using fallback IP");
    IPAddress ip(192, 168, 1, 100);
    Ethernet.begin(mac, ip);
  }

  delay(1000);
  Serial.print("IP Address: ");
  Serial.println(Ethernet.localIP());

  updateDeviceStatus("online");
}

void loop() {
  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    float temperature = readTemperature();
    int lightLevel = readLightLevel();

    sendSensorData("temperature", temperature, "celsius");
    sendSensorData("light", (float)lightLevel, "lux");

    Serial.print("Temp: ");
    Serial.print(temperature);
    Serial.print("C, Light: ");
    Serial.println(lightLevel);
  }
}

float readTemperature() {
  int reading = analogRead(TEMP_PIN);
  float voltage = reading * 5.0 / 1024.0;
  float temperature = (voltage - 0.5) * 100.0; // TMP36 formula
  return temperature;
}

int readLightLevel() {
  return analogRead(LIGHT_PIN);
}

void sendSensorData(const char* sensorType, float value, const char* unit) {
  JsonDocument doc;
  doc["command_type"] = "sensor_read";
  doc["issued_by"] = "00000000-0000-0000-0000-000000000000";

  JsonObject payload = doc["payload"].to<JsonObject>();
  payload["sensor_type"] = sensorType;
  payload["value"] = value;
  payload["unit"] = unit;

  String jsonStr;
  serializeJson(doc, jsonStr);

  String path = String("/api/v1/devices/") + DEVICE_ID + "/command";

  httpClient.beginRequest();
  httpClient.post(path);
  httpClient.sendHeader("Content-Type", "application/json");
  httpClient.sendHeader("Authorization", String("Bearer ") + API_KEY);
  httpClient.sendHeader("Content-Length", jsonStr.length());
  httpClient.beginBody();
  httpClient.print(jsonStr);
  httpClient.endRequest();

  int statusCode = httpClient.responseStatusCode();
  if (statusCode == 201) {
    Serial.print("Sent ");
    Serial.println(sensorType);
  } else {
    Serial.print("Error: ");
    Serial.println(statusCode);
  }

  httpClient.stop();
}

void updateDeviceStatus(const char* status) {
  String path = String("/api/v1/devices/") + DEVICE_ID + "/status?status=" + status;

  httpClient.beginRequest();
  httpClient.put(path);
  httpClient.sendHeader("Authorization", String("Bearer ") + API_KEY);
  httpClient.endRequest();

  int statusCode = httpClient.responseStatusCode();
  Serial.print("Status update: ");
  Serial.println(statusCode);

  httpClient.stop();
}
