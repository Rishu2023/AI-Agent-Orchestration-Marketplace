from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ApiKeyCreate(BaseModel):
    user_id: UUID
    name: str = Field(..., max_length=200)
    tier: str = Field(default="free", pattern="^(free|pro|enterprise)$")


class ApiKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    tier: str
    rate_limit: int
    usage_count: int
    last_used_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None


class ApiKeyCreatedResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    tier: str
    rate_limit: int
    raw_key: str
    created_at: datetime


class BillingPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    tier: str
    price_monthly: float
    price_yearly: float
    rate_limit: int
    features: Optional[Dict[str, Any]] = None
    is_active: bool


class SubscribeRequest(BaseModel):
    user_id: UUID
    plan_id: UUID


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    plan_id: UUID
    stripe_subscription_id: Optional[str] = None
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime


class UsageRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    api_key_id: UUID
    endpoint: str
    method: str
    tokens_used: int
    cost: float
    created_at: datetime


class UsageStatsResponse(BaseModel):
    user_id: UUID
    total_requests: int
    total_tokens: int
    total_cost: float
    records: List[UsageRecordResponse]
