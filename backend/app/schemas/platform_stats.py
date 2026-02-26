from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class PlatformStatsResponse(BaseModel):
    total_agents: int
    total_federated_agents: int
    total_users: int
    total_workflows: int
    executions_today: int
    executions_week: int
    executions_month: int
    total_credits_supply: float
    credits_velocity: float
    federation_nodes_count: int
    top_models: Optional[List[Any]] = None
    top_agents: Optional[List[Any]] = None
    benchmark_trends: Optional[List[Any]] = None


class PlatformSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    total_agents: int
    total_federated_agents: int
    total_users: int
    total_workflows: int
    executions_today: int
    executions_week: int
    executions_month: int
    total_credits_supply: float
    credits_velocity: float
    federation_nodes_count: int
    top_models: Optional[List[Any]] = None
    top_agents: Optional[List[Any]] = None
    benchmark_trends: Optional[List[Any]] = None
    snapshot_at: datetime


class SnapshotHistoryResponse(BaseModel):
    snapshots: List[PlatformSnapshotResponse]
    total: int
