from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class BenchmarkRunRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_provider: str = Field(..., max_length=50)
    model_name: str = Field(..., max_length=100)


class BenchmarkResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: UUID
    model_provider: str
    model_name: str
    reasoning_score: float
    creativity_score: float
    code_generation_score: float
    instruction_following_score: float
    multi_step_planning_score: float
    self_correction_score: float
    tool_use_score: float
    memory_retrieval_score: float
    overall_score: float
    run_duration_ms: int
    total_cost: float
    benchmark_version: str
    created_at: datetime


class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_provider: str
    model_name: str
    overall_score: float
    reasoning_score: float
    creativity_score: float
    code_generation_score: float
    run_count: int


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]


class ModelComparisonResponse(BaseModel):
    models: List[BenchmarkResultResponse]


class BenchmarkHistoryResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_name: str
    history: List[BenchmarkResultResponse]
