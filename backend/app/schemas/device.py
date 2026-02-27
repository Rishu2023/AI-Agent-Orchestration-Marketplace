from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DeviceRegister(BaseModel):
    name: str = Field(..., max_length=200)
    device_type: str = Field(..., pattern="^(robot|drone|camera|sensor|industrial|edge|robotic_arm|vehicle|actuator)$")
    owner_id: UUID
    capabilities: List[str] = []
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    metadata_info: Optional[dict] = None


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    device_type: str
    owner_id: UUID
    capabilities: list
    status: str
    location_lat: Optional[float]
    location_lng: Optional[float]
    metadata_info: Optional[dict]
    last_seen_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class DeviceListResponse(BaseModel):
    devices: List[DeviceResponse]
    total: int


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    capabilities: Optional[List[str]] = None
    status: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class DeviceCommandCreate(BaseModel):
    command_type: str = Field(..., pattern="^(movement|vision_capture|sensor_read|audio_output|actuator_trigger|data_collection|emergency_stop|reboot|firmware_update)$")
    payload: dict = {}
    issued_by: UUID
    timeout_seconds: int = Field(default=30, ge=1, le=300)


class DeviceCommandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    command_type: str
    payload: dict
    status: str
    result: Optional[dict]
    issued_by: UUID
    retry_count: int
    created_at: datetime
    completed_at: Optional[datetime]


class DigitalTwinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    state: dict
    last_synced_at: Optional[datetime]
    divergence_score: float
    created_at: datetime


class TwinSimulateRequest(BaseModel):
    action: str
    parameters: dict = {}


class DeviceListingCreate(BaseModel):
    device_id: UUID
    owner_id: UUID
    description: str
    price_per_command: float = Field(default=1.0, ge=0.0)
    price_per_hour: Optional[float] = None
    availability_schedule: Optional[dict] = None
    usage_terms: Optional[str] = None


class DeviceListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    owner_id: UUID
    description: str
    price_per_command: float
    price_per_hour: Optional[float]
    is_active: bool
    created_at: datetime


class EdgeDeployRequest(BaseModel):
    device_id: UUID
    model_name: str = Field(..., max_length=200)
    model_version: str = Field(..., max_length=50)
    quantization: str = Field(default="FP16", pattern="^(INT8|FP16|FP32)$")


class EdgeDeploymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    device_id: UUID
    model_name: str
    model_version: str
    quantization: str
    status: str
    deployed_at: Optional[datetime]
    last_sync_at: Optional[datetime]
    performance_metrics: dict
    created_at: datetime
