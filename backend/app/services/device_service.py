import uuid
import hashlib
import secrets
import logging
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.device import Device, DeviceCommand, DigitalTwin, DeviceListing, EdgeDeployment

logger = logging.getLogger(__name__)


# Device Registry


def register_device(
    db: Session,
    name: str,
    device_type: str,
    owner_id: uuid.UUID,
    capabilities: list = None,
    location_lat: float = None,
    location_lng: float = None,
    metadata_info: dict = None,
) -> tuple:
    """Register a new device. Returns (Device, raw_api_key)."""
    raw_key = f"dev_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    device = Device(
        name=name,
        device_type=device_type,
        owner_id=owner_id,
        api_key_hash=key_hash,
        capabilities=capabilities or [],
        location_lat=location_lat,
        location_lng=location_lng,
        metadata_info=metadata_info or {},
        status="offline",
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    # Create digital twin automatically
    twin = DigitalTwin(device_id=device.id, state={}, history=[])
    db.add(twin)
    db.commit()
    logger.info(f"Registered device {device.id} of type {device_type}")
    return device, raw_key


def list_devices(
    db: Session,
    owner_id: uuid.UUID = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Device], int]:
    """List devices, optionally filtered by owner."""
    query = db.query(Device)
    if owner_id:
        query = query.filter(Device.owner_id == owner_id)
    total = query.count()
    devices = (
        query.order_by(desc(Device.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return devices, total


def get_device(db: Session, device_id: uuid.UUID) -> Optional[Device]:
    return db.query(Device).filter(Device.id == device_id).first()


def update_device(db: Session, device_id: uuid.UUID, **kwargs) -> Optional[Device]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    for key, value in kwargs.items():
        if value is not None and hasattr(device, key):
            setattr(device, key, value)
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device


def deregister_device(db: Session, device_id: uuid.UUID) -> Optional[Device]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    # Remove associated records
    db.query(DeviceCommand).filter(DeviceCommand.device_id == device_id).delete()
    db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).delete()
    db.query(DeviceListing).filter(DeviceListing.device_id == device_id).delete()
    db.query(EdgeDeployment).filter(EdgeDeployment.device_id == device_id).delete()
    db.delete(device)
    db.commit()
    logger.info(f"Deregistered device {device_id}")
    return device


def update_device_status(
    db: Session, device_id: uuid.UUID, status: str
) -> Optional[Device]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    device.status = status
    device.last_seen_at = datetime.utcnow()
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device


# Device Commands


def send_command(
    db: Session,
    device_id: uuid.UUID,
    command_type: str,
    payload: dict,
    issued_by: uuid.UUID,
    timeout_seconds: int = 30,
) -> Optional[DeviceCommand]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    command = DeviceCommand(
        device_id=device_id,
        command_type=command_type,
        payload=payload,
        issued_by=issued_by,
        status="queued",
        timeout_seconds=timeout_seconds,
    )
    db.add(command)
    db.commit()
    db.refresh(command)
    # Update twin state
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if twin:
        history = twin.history or []
        history.append(
            {
                "command": command_type,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        twin.history = history[-100:]  # Keep last 100 entries
        twin.updated_at = datetime.utcnow()
        db.commit()
    logger.info(f"Command {command.id} sent to device {device_id}")
    return command


def get_command(db: Session, command_id: uuid.UUID) -> Optional[DeviceCommand]:
    return db.query(DeviceCommand).filter(DeviceCommand.id == command_id).first()


def list_device_commands(
    db: Session,
    device_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[DeviceCommand], int]:
    query = db.query(DeviceCommand).filter(DeviceCommand.device_id == device_id)
    total = query.count()
    commands = (
        query.order_by(desc(DeviceCommand.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return commands, total


# Digital Twins


def get_twin(db: Session, device_id: uuid.UUID) -> Optional[DigitalTwin]:
    return db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()


def update_twin_state(
    db: Session, device_id: uuid.UUID, state: dict
) -> Optional[DigitalTwin]:
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        return None
    twin.state = state
    twin.last_synced_at = datetime.utcnow()
    twin.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(twin)
    return twin


def simulate_twin_action(
    db: Session, device_id: uuid.UUID, action: str, parameters: dict
) -> Optional[dict]:
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        return None
    simulation_result = {
        "action": action,
        "parameters": parameters,
        "simulated_state": {**(twin.state or {}), "last_action": action},
        "timestamp": datetime.utcnow().isoformat(),
        "safe": True,
        "warnings": [],
    }
    history = twin.history or []
    history.append(
        {
            "type": "simulation",
            "action": action,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
    twin.history = history[-100:]
    twin.updated_at = datetime.utcnow()
    db.commit()
    return simulation_result


def get_twin_history(db: Session, device_id: uuid.UUID) -> Optional[list]:
    twin = db.query(DigitalTwin).filter(DigitalTwin.device_id == device_id).first()
    if not twin:
        return None
    return twin.history or []


# Device Marketplace


def create_listing(
    db: Session,
    device_id: uuid.UUID,
    owner_id: uuid.UUID,
    description: str,
    price_per_command: float = 1.0,
    price_per_hour: float = None,
    availability_schedule: dict = None,
    usage_terms: str = None,
) -> Optional[DeviceListing]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    listing = DeviceListing(
        device_id=device_id,
        owner_id=owner_id,
        description=description,
        price_per_command=price_per_command,
        price_per_hour=price_per_hour,
        availability_schedule=availability_schedule or {},
        usage_terms=usage_terms,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def list_marketplace(
    db: Session, page: int = 1, page_size: int = 20
) -> Tuple[List[DeviceListing], int]:
    query = db.query(DeviceListing).filter(DeviceListing.is_active == True)
    total = query.count()
    listings = (
        query.order_by(desc(DeviceListing.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return listings, total


# Edge Deployments


def deploy_to_edge(
    db: Session,
    device_id: uuid.UUID,
    model_name: str,
    model_version: str,
    quantization: str = "FP16",
) -> Optional[EdgeDeployment]:
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        return None
    deployment = EdgeDeployment(
        device_id=device_id,
        model_name=model_name,
        model_version=model_version,
        quantization=quantization,
        status="deploying",
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    logger.info(f"Edge deployment {deployment.id} started for device {device_id}")
    return deployment


def get_edge_deployments(
    db: Session, device_id: uuid.UUID
) -> List[EdgeDeployment]:
    return (
        db.query(EdgeDeployment)
        .filter(EdgeDeployment.device_id == device_id)
        .order_by(desc(EdgeDeployment.created_at))
        .all()
    )


def update_edge_deployment_status(
    db: Session,
    deployment_id: uuid.UUID,
    status: str,
    performance_metrics: dict = None,
) -> Optional[EdgeDeployment]:
    deployment = (
        db.query(EdgeDeployment).filter(EdgeDeployment.id == deployment_id).first()
    )
    if not deployment:
        return None
    deployment.status = status
    if status == "deployed":
        deployment.deployed_at = datetime.utcnow()
    if performance_metrics:
        deployment.performance_metrics = performance_metrics
    deployment.last_sync_at = datetime.utcnow()
    db.commit()
    db.refresh(deployment)
    return deployment
