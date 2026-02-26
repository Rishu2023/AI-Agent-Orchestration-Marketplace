from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    admin_id: UUID
    action: str
    target_type: str
    target_id: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime


class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total: int
    page: int
    page_size: int


class AnnouncementCreate(BaseModel):
    title: str = Field(..., max_length=300)
    content: str
    announcement_type: str = Field(default="info", pattern="^(info|warning|critical)$")
    admin_id: UUID
    expires_at: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    content: str
    announcement_type: str
    is_active: bool
    created_by: UUID
    created_at: datetime
    expires_at: Optional[datetime] = None


class KillSwitchCreate(BaseModel):
    target_type: str = Field(..., pattern="^(agent|workflow|global)$")
    target_id: Optional[UUID] = None
    reason: str
    admin_id: UUID


class KillSwitchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    target_type: str
    target_id: Optional[UUID] = None
    reason: str
    activated_by: UUID
    is_active: bool
    created_at: datetime
    deactivated_at: Optional[datetime] = None


class BanUserRequest(BaseModel):
    admin_id: UUID


class CreditAdjustRequest(BaseModel):
    user_id: UUID
    amount: float
    admin_id: UUID


class BenchmarkOverrideRequest(BaseModel):
    scores: Dict[str, float]
    admin_id: UUID
