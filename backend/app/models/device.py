import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON, Uuid
from app.database.session import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    device_type = Column(String(50), nullable=False)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    api_key_hash = Column(String(255), nullable=False)
    capabilities = Column(JSON, default=list)
    status = Column(String(20), default="offline")
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    metadata_info = Column(JSON, default=dict)
    last_seen_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DeviceCommand(Base):
    __tablename__ = "device_commands"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    device_id = Column(Uuid, ForeignKey("devices.id"), nullable=False)
    command_type = Column(String(50), nullable=False)
    payload = Column(JSON, default=dict)
    status = Column(String(20), default="queued")
    result = Column(JSON, nullable=True)
    issued_by = Column(Uuid, ForeignKey("users.id"), nullable=False)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    device_id = Column(Uuid, ForeignKey("devices.id"), nullable=False, unique=True)
    state = Column(JSON, default=dict)
    last_synced_at = Column(DateTime, nullable=True)
    divergence_score = Column(Float, default=0.0)
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DeviceListing(Base):
    __tablename__ = "device_listings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    device_id = Column(Uuid, ForeignKey("devices.id"), nullable=False)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    price_per_command = Column(Float, default=1.0)
    price_per_hour = Column(Float, nullable=True)
    availability_schedule = Column(JSON, default=dict)
    usage_terms = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EdgeDeployment(Base):
    __tablename__ = "edge_deployments"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    device_id = Column(Uuid, ForeignKey("devices.id"), nullable=False)
    model_name = Column(String(200), nullable=False)
    model_version = Column(String(50), nullable=False)
    quantization = Column(String(20), default="FP16")
    status = Column(String(20), default="deploying")
    deployed_at = Column(DateTime, nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    performance_metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
