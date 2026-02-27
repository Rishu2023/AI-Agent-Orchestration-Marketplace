import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.device import Device, DeviceCommand, DigitalTwin

logger = logging.getLogger(__name__)


def subscribe_sensor(
    db: Session,
    device_id: uuid.UUID,
    sensor_type: str,
    threshold_config: dict,
) -> Optional[DeviceCommand]:
    """Subscribe to sensor data from a device."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for sensor subscription")
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type="sensor_read",
        payload={
            "sensor_type": sensor_type,
            "threshold_config": threshold_config,
        },
        issued_by=device.owner_id,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(
        f"Sensor subscription created for device {device_id}, type={sensor_type}"
    )
    return command


def publish_sensor_data(
    db: Session,
    device_id: uuid.UUID,
    sensor_type: str,
    value: float,
    unit: str,
) -> Optional[DigitalTwin]:
    """Record sensor data reading by updating the device's digital twin state."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for sensor data publish")
        return None
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        logger.warning(f"Digital twin not found for device {device_id}")
        return None
    state = twin.state or {}
    sensors = state.get("sensors", {})
    sensors[sensor_type] = {
        "value": value,
        "unit": unit,
        "timestamp": datetime.utcnow().isoformat(),
    }
    state["sensors"] = sensors
    twin.state = state
    twin.last_synced_at = datetime.utcnow()
    twin.updated_at = datetime.utcnow()
    history = twin.history or []
    history.append({
        "type": "sensor_reading",
        "sensor_type": sensor_type,
        "value": value,
        "unit": unit,
        "timestamp": datetime.utcnow().isoformat(),
    })
    twin.history = history[-100:]
    db.commit()
    db.refresh(twin)
    logger.info(
        f"Sensor data published for device {device_id}: {sensor_type}={value}{unit}"
    )
    return twin


def set_trigger(
    db: Session,
    device_id: uuid.UUID,
    sensor_type: str,
    condition: str,
    threshold: float,
    action: str,
) -> Optional[DeviceCommand]:
    """Set a trigger rule for sensor data."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for trigger setup")
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type="data_collection",
        payload={
            "sensor_type": sensor_type,
            "condition": condition,
            "threshold": threshold,
            "action": action,
        },
        issued_by=device.owner_id,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(
        f"Trigger set for device {device_id}: {sensor_type} {condition} {threshold}"
    )
    return command


def get_sensor_history(
    db: Session,
    device_id: uuid.UUID,
    sensor_type: str,
    limit: int = 100,
) -> Optional[List[dict]]:
    """Get historical sensor readings from twin history filtered by sensor_type."""
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        logger.warning(f"Digital twin not found for device {device_id}")
        return None
    history = twin.history or []
    filtered = [
        entry for entry in history
        if entry.get("type") == "sensor_reading"
        and entry.get("sensor_type") == sensor_type
    ]
    return filtered[-limit:]


def list_sensors(
    db: Session,
    device_id: uuid.UUID,
) -> Optional[List[str]]:
    """List all sensor types available on a device based on capabilities."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found")
        return None
    capabilities = device.capabilities or []
    sensor_types = [
        cap for cap in capabilities
        if isinstance(cap, str) and cap.startswith("sensor_")
    ]
    # Also include sensors observed in the twin state
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if twin and twin.state:
        sensors = twin.state.get("sensors", {})
        for sensor_type in sensors:
            if sensor_type not in sensor_types:
                sensor_types.append(sensor_type)
    return sensor_types


def get_sensor_status(
    db: Session,
    device_id: uuid.UUID,
) -> Optional[dict]:
    """Get current sensor readings from twin state."""
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        logger.warning(f"Digital twin not found for device {device_id}")
        return None
    state = twin.state or {}
    return state.get("sensors", {})
