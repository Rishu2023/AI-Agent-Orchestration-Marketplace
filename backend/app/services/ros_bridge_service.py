import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.models.device import Device, DeviceCommand

logger = logging.getLogger(__name__)


def connect_robot(
    db: Session,
    device_id: uuid.UUID,
    ros_master_uri: str,
) -> Optional[Device]:
    """Connect a robot running ROS2. Updates metadata and sets status to online."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for ROS connection")
        return None
    metadata = device.metadata_info or {}
    metadata["ros_master_uri"] = ros_master_uri
    metadata["ros_connected_at"] = datetime.utcnow().isoformat()
    metadata.setdefault("ros_topics", [])
    metadata.setdefault("ros_services", [])
    metadata.setdefault("ros_subscriptions", [])
    device.metadata_info = metadata
    device.status = "online"
    device.last_seen_at = datetime.utcnow()
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    logger.info(f"Robot {device_id} connected via ROS at {ros_master_uri}")
    return device


def list_topics(
    db: Session,
    device_id: uuid.UUID,
) -> Optional[List[dict]]:
    """Get list of ROS2 topics from device metadata."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found")
        return None
    metadata = device.metadata_info or {}
    return metadata.get("ros_topics", [])


def publish_topic(
    db: Session,
    device_id: uuid.UUID,
    topic_name: str,
    message_type: str,
    data: dict,
    issued_by: uuid.UUID,
) -> Optional[DeviceCommand]:
    """Publish a message to a ROS2 topic."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for topic publish")
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type="ros_publish",
        payload={
            "topic_name": topic_name,
            "message_type": message_type,
            "data": data,
        },
        issued_by=issued_by,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(f"ROS publish to {topic_name} on device {device_id}")
    return command


def subscribe_topic(
    db: Session,
    device_id: uuid.UUID,
    topic_name: str,
    callback_url: str,
) -> Optional[Device]:
    """Subscribe to a ROS2 topic. Stores subscription in device metadata."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for topic subscription")
        return None
    metadata = device.metadata_info or {}
    subscriptions = metadata.get("ros_subscriptions", [])
    # Avoid duplicate subscriptions for the same topic and callback
    for sub in subscriptions:
        if sub.get("topic_name") == topic_name and sub.get("callback_url") == callback_url:
            logger.info(
                f"Subscription already exists for {topic_name} on device {device_id}"
            )
            return device
    subscriptions.append({
        "topic_name": topic_name,
        "callback_url": callback_url,
        "subscribed_at": datetime.utcnow().isoformat(),
    })
    metadata["ros_subscriptions"] = subscriptions
    device.metadata_info = metadata
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    logger.info(f"Subscribed to {topic_name} on device {device_id}")
    return device


def call_service(
    db: Session,
    device_id: uuid.UUID,
    service_name: str,
    request_data: dict,
    issued_by: uuid.UUID,
) -> Optional[DeviceCommand]:
    """Call a ROS2 service. Creates a DeviceCommand with the service call details."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for ROS service call")
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type="ros_service_call",
        payload={
            "service_name": service_name,
            "request_data": request_data,
        },
        issued_by=issued_by,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(f"ROS service call to {service_name} on device {device_id}")
    return command


def get_robot_status(
    db: Session,
    device_id: uuid.UUID,
) -> Optional[dict]:
    """Get current robot status including active topics, services, and mission status."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found")
        return None
    metadata = device.metadata_info or {}
    return {
        "device_id": str(device.id),
        "status": device.status,
        "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None,
        "ros_master_uri": metadata.get("ros_master_uri"),
        "ros_connected_at": metadata.get("ros_connected_at"),
        "active_topics": metadata.get("ros_topics", []),
        "active_services": metadata.get("ros_services", []),
        "subscriptions": metadata.get("ros_subscriptions", []),
        "mission_status": metadata.get("mission_status"),
    }
