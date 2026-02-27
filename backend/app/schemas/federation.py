from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class FederationNodeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    url: str = Field(..., min_length=1, max_length=500)
    api_key: str = Field(..., min_length=1, max_length=500)
    location: Dict[str, Any] = {}


class FederationNodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    url: str
    location: Dict[str, Any]
    status: str
    agent_count: int
    last_heartbeat: Optional[datetime] = None
    created_at: datetime


class FederatedAgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    node_id: UUID
    remote_agent_id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    performance_score: float
    origin_server: Optional[str] = None
    synced_at: datetime
    created_at: datetime


class FederationNodeListResponse(BaseModel):
    nodes: List[FederationNodeResponse]
    total: int


class FederatedAgentListResponse(BaseModel):
    agents: List[FederatedAgentResponse]
    total: int
