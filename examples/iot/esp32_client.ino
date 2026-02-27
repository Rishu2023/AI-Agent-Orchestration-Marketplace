/*
 * AgentHub IoT Client - ESP32 Example
 * ====================================
 *
 * This Arduino sketch demonstrates how to connect an ESP32
 * to the AgentHub platform as an IoT sensor device.
 *
 * Requirements:
 *   - ESP32 board package installed in Arduino IDE
 *   - ArduinoJson library (install via Library Manager)
 *   - WiFi connectivity
 *
 * Wiring:
 *   - DHT22 sensor on GPIO 4 (optional, uses simulated data if not connected)
 *   - Built-in LED for status indication
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration - UPDATE THESE VALUES
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* AGENTHUB_URL = "https://your-agenthub-url";
const char* API_KEY = "dev_your_api_key_here";
const char* DEVICE_ID = "your-device-uuid-here";

// Sensor pin
const int DHT_PIN = 4;
const int LED_PIN = 2;

// Timing
const unsigned long SEND_INTERVAL = 10000; // 10 seconds
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  // Connect to WiFi
  Serial.printf("Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_PIN, HIGH);
    updateDeviceStatus("online");
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, LOW);
    delay(5000);
    WiFi.reconnect();
    return;
  }

  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    // Read sensors (simulated if no hardware connected)
    float temperature = readTemperature();
    float humidity = readHumidity();

    // Send to AgentHub
    sendSensorData("temperature", temperature, "celsius");
    sendSensorData("humidity", humidity, "percent");

    Serial.printf("Sent: temp=%.1f°C, humidity=%.1f%%\n", temperature, humidity);
  }

  delay(100);
}

float readTemperature() {
  // Simulated temperature reading
  // Replace with actual DHT22/BME280 reading for real hardware
  return 20.0 + random(-50, 100) / 10.0;
}

float readHumidity() {
  // Simulated humidity reading
  return 40.0 + random(0, 300) / 10.0;
}

void sendSensorData(const char* sensorType, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(AGENTHUB_URL) + "/api/v1/devices/" + DEVICE_ID + "/command";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);

  // Build JSON payload
  JsonDocument doc;
  doc["command_type"] = "sensor_read";
  doc["issued_by"] = "00000000-0000-0000-0000-000000000000";

  JsonObject payload = doc["payload"].to<JsonObject>();
  payload["sensor_type"] = sensorType;
  payload["value"] = value;
  payload["unit"] = unit;

  String jsonStr;
  serializeJson(doc, jsonStr);

  int httpCode = http.POST(jsonStr);
  if (httpCode == 201) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Blink on success
  } else {
    Serial.printf("HTTP error: %d\n", httpCode);
  }

  http.end();
}

void updateDeviceStatus(const char* status) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(AGENTHUB_URL) + "/api/v1/devices/" + DEVICE_ID + "/status?status=" + status;
  http.begin(url);
  http.addHeader("Authorization", String("Bearer ") + API_KEY);

  int httpCode = http.PUT("");
  Serial.printf("Status update (%s): %d\n", status, httpCode);

  http.end();
}
