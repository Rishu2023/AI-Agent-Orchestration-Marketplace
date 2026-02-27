import uuid
import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.device import Device, DeviceCommand

logger = logging.getLogger(__name__)

VALID_ANALYSIS_TYPES = [
    "object_detection",
    "scene_understanding",
    "ocr",
    "anomaly_detection",
    "motion_detection",
    "depth_estimation",
]

PERSON_DETECTION_TYPES = ["object_detection", "scene_understanding", "motion_detection"]


def capture_image(
    db: Session,
    device_id: uuid.UUID,
    issued_by: uuid.UUID,
    settings: dict = None,
) -> Optional[DeviceCommand]:
    """Request image capture from camera device."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for image capture")
        return None
    payload = {"action": "capture"}
    if settings:
        payload["settings"] = settings
    command = DeviceCommand(
        device_id=device_id,
        command_type="vision_capture",
        payload=payload,
        issued_by=issued_by,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(f"Image capture requested for device {device_id}")
    return command


def analyze_image(
    db: Session,
    device_id: uuid.UUID,
    analysis_type: str,
    issued_by: uuid.UUID,
    consent_flags: dict = None,
) -> Optional[DeviceCommand]:
    """Run vision analysis on a device."""
    if analysis_type not in VALID_ANALYSIS_TYPES:
        logger.error(f"Invalid analysis type: {analysis_type}")
        return None
    if analysis_type in PERSON_DETECTION_TYPES and not check_consent(consent_flags):
        logger.warning(
            f"Consent required for {analysis_type} on device {device_id}"
        )
        return None
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for vision analysis")
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type="vision_capture",
        payload={
            "action": "analyze",
            "analysis_type": analysis_type,
            "consent_flags": consent_flags or {},
        },
        issued_by=issued_by,
        status="queued",
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    logger.info(
        f"Vision analysis '{analysis_type}' requested for device {device_id}"
    )
    return command


def get_analysis_history(
    db: Session,
    device_id: uuid.UUID,
    analysis_type: str = None,
    limit: int = 50,
) -> List[DeviceCommand]:
    """Get past analysis results from device commands filtered by vision_capture type."""
    query = db.query(DeviceCommand).filter(
        DeviceCommand.device_id == device_id,
        DeviceCommand.command_type == "vision_capture",
    )
    if analysis_type:
        query = query.filter(
            DeviceCommand.payload["analysis_type"].as_string() == analysis_type
        )
    commands = (
        query.order_by(desc(DeviceCommand.created_at))
        .limit(limit)
        .all()
    )
    return commands


def configure_vision(
    db: Session,
    device_id: uuid.UUID,
    config: dict,
) -> Optional[Device]:
    """Update vision configuration on a device."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        logger.warning(f"Device {device_id} not found for vision configuration")
        return None
    metadata = device.metadata_info or {}
    metadata["vision_config"] = config
    device.metadata_info = metadata
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    logger.info(f"Vision configuration updated for device {device_id}")
    return device


def check_consent(consent_flags: dict = None) -> bool:
    """Verify consent flags for person detection. Returns True if consent is granted."""
    if not consent_flags:
        return False
    return bool(consent_flags.get("person_detection_consent", False))
