# AgentHub IoT Example Clients

Example client code for connecting physical devices to the AgentHub platform.

## Supported Devices

### Raspberry Pi (`raspberry_pi_client.py`)
Python client for Raspberry Pi with GPIO sensor support.

```bash
pip install requests
python raspberry_pi_client.py --api-url https://your-agenthub-url --api-key dev_your_key
```

### ESP32 (`esp32_client.ino`)
Arduino sketch for ESP32 with WiFi connectivity.

1. Open in Arduino IDE
2. Install `ArduinoJson` library via Library Manager
3. Update WiFi credentials and API configuration
4. Upload to ESP32

### Arduino (`arduino_client.ino`)
Arduino sketch for Arduino with Ethernet Shield.

1. Open in Arduino IDE
2. Install `ArduinoHttpClient` and `ArduinoJson` libraries
3. Update network and API configuration
4. Upload to Arduino

## API Endpoints Used

- `POST /api/v1/devices/register` - Register device
- `PUT /api/v1/devices/{id}/status` - Update online/offline status
- `POST /api/v1/devices/{id}/command` - Send sensor readings
- `GET /api/v1/devices/{id}/twin` - Get digital twin state

## Sensor Data Format

All clients send sensor data using the command endpoint:

```json
{
  "command_type": "sensor_read",
  "payload": {
    "sensor_type": "temperature",
    "value": 23.5,
    "unit": "celsius"
  },
  "issued_by": "user-uuid"
}
```
