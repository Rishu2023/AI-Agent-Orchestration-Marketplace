from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class ModelUsageBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    agent_id: Optional[UUID] = None
    user_id: UUID
    model_provider: str
    model_name: str
    tokens_input: int = 0
    tokens_output: int = 0
    cost: float = 0.0
    latency_ms: int = 0
    status: str = "completed"


class ModelUsageCreate(ModelUsageBase):
    pass


class ModelUsageResponse(ModelUsageBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: UUID
    created_at: datetime


class ModelUsageStats(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = 0
    total_tokens_input: int = 0
    total_tokens_output: int = 0
    total_cost: float = 0.0
    average_latency_ms: float = 0.0
    by_provider: dict = {}
    by_model: dict = {}
