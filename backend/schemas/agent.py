from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class AgentBase(BaseModel):
    name: str
    description: str
    category: str
    pricing_type: str = "free"
    price: float = 0.0
    system_prompt: str
    tools_config: Optional[str] = None


class AgentCreate(AgentBase):
    @field_validator("pricing_type")
    @classmethod
    def validate_pricing_type(cls, v: str) -> str:
        allowed = {"free", "per_use", "subscription"}
        if v not in allowed:
            raise ValueError(f"pricing_type must be one of {allowed}")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v < 0:
            raise ValueError("price must be non-negative")
        return v


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    pricing_type: Optional[str] = None
    price: Optional[float] = None
    system_prompt: Optional[str] = None
    tools_config: Optional[str] = None


class AgentResponse(AgentBase):
    id: int
    creator_id: int
    is_published: bool
    is_featured: bool
    rating: float
    review_count: int
    execution_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentListResponse(BaseModel):
    items: list[AgentResponse]
    total: int
    page: int
    page_size: int
