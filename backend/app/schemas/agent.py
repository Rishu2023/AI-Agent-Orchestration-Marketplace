from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    long_description: Optional[str] = None
    category: str = "other"
    tags: List[str] = []
    system_prompt: Optional[str] = None
    model_provider: str = "openai"
    model_name: str = "gpt-4"
    tools: List[Dict[str, Any]] = []
    parameters: Dict[str, Any] = {}
    input_schema: Optional[Dict[str, Any]] = None
    output_schema: Optional[Dict[str, Any]] = None
    pricing_model: str = "free"
    price: float = 0.0


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    long_description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    system_prompt: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    tools: Optional[List[Dict[str, Any]]] = None
    parameters: Optional[Dict[str, Any]] = None
    pricing_model: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None


class AgentResponse(AgentBase):
    id: UUID
    slug: str
    publisher_id: UUID
    status: str
    is_featured: bool
    total_runs: int
    average_rating: float
    total_reviews: int
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentListResponse(BaseModel):
    agents: List[AgentResponse]
    total: int
    page: int
    page_size: int


class AgentExecuteRequest(BaseModel):
    input: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = None


class AgentExecuteResponse(BaseModel):
    execution_id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    tokens_used: int = 0
    cost: float = 0.0
    duration_ms: int = 0
