"""
AgentHub IoT Client - Raspberry Pi Example
==========================================

This script demonstrates how to connect a Raspberry Pi to the
AgentHub platform as an IoT sensor device.

Requirements:
    pip install requests

Usage:
    python raspberry_pi_client.py --api-url https://your-agenthub-url --api-key dev_your_key
"""

import time
import json
import random
import argparse
import logging
from datetime import datetime

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    raise

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Try to import Raspberry Pi GPIO (works on actual Pi, skipped on other platforms)
try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False
    logger.info("RPi.GPIO not available - using simulated sensor data")


class AgentHubIoTClient:
    """Client for connecting Raspberry Pi sensors to AgentHub platform."""

    def __init__(self, api_url: str, api_key: str, device_id: str = None):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.device_id = device_id
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        })

    def register(self, name: str = "Raspberry Pi Sensor", capabilities: list = None) -> str:
        """Register this device with the platform."""
        payload = {
            "name": name,
            "device_type": "sensor",
            "owner_id": "00000000-0000-0000-0000-000000000000",
            "capabilities": capabilities or ["measure"],
            "metadata_info": {"platform": "raspberry_pi", "python_version": "3"},
        }
        resp = self.session.post(f"{self.api_url}/api/v1/devices/register", json=payload)
        resp.raise_for_status()
        data = resp.json()
        self.device_id = data["device"]["id"]
        logger.info("Registered device: %s", self.device_id)
        return self.device_id

    def update_status(self, status: str = "online") -> None:
        """Update device status."""
        resp = self.session.put(
            f"{self.api_url}/api/v1/devices/{self.device_id}/status",
            params={"status": status},
        )
        resp.raise_for_status()
        logger.info("Status updated to: %s", status)

    def send_sensor_data(self, sensor_type: str, value: float, unit: str) -> None:
        """Send sensor reading to the platform."""
        payload = {
            "command_type": "sensor_read",
            "payload": {
                "sensor_type": sensor_type,
                "value": value,
                "unit": unit,
                "timestamp": datetime.utcnow().isoformat(),
            },
            "issued_by": "00000000-0000-0000-0000-000000000000",
        }
        resp = self.session.post(
            f"{self.api_url}/api/v1/devices/{self.device_id}/command",
            json=payload,
        )
        resp.raise_for_status()
        logger.info("Sent %s: %.2f %s", sensor_type, value, unit)

    def read_temperature(self) -> float:
        """Read temperature from sensor or simulate."""
        if GPIO_AVAILABLE:
            # Example: DS18B20 temperature sensor reading
            try:
                with open("/sys/bus/w1/devices/28-*/w1_slave", "r") as f:
                    lines = f.readlines()
                    if "YES" in lines[0]:
                        temp_str = lines[1].split("t=")[1]
                        return float(temp_str) / 1000.0
            except (FileNotFoundError, IndexError):
                pass
        return 20.0 + random.uniform(-5, 10)

    def read_humidity(self) -> float:
        """Read humidity or simulate."""
        return 40.0 + random.uniform(0, 30)

    def run(self, interval: int = 10) -> None:
        """Main loop: read sensors and send data at regular intervals."""
        self.update_status("online")
        logger.info("Starting sensor data loop (interval=%ds)", interval)
        try:
            while True:
                temperature = self.read_temperature()
                self.send_sensor_data("temperature", temperature, "celsius")

                humidity = self.read_humidity()
                self.send_sensor_data("humidity", humidity, "percent")

                time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            self.update_status("offline")


def main():
    parser = argparse.ArgumentParser(description="AgentHub Raspberry Pi IoT Client")
    parser.add_argument("--api-url", required=True, help="AgentHub API URL")
    parser.add_argument("--api-key", required=True, help="Device API key")
    parser.add_argument("--device-id", help="Existing device ID (skip registration)")
    parser.add_argument("--interval", type=int, default=10, help="Seconds between readings")
    parser.add_argument("--name", default="Raspberry Pi Sensor", help="Device name")
    args = parser.parse_args()

    client = AgentHubIoTClient(args.api_url, args.api_key, args.device_id)

    if not args.device_id:
        client.register(name=args.name)

    client.run(interval=args.interval)


if __name__ == "__main__":
    main()
