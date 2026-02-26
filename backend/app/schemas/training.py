from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class TrainingJobCreateRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_name: str = Field(..., max_length=100)
    base_model: str = Field(..., max_length=100)
    dataset_name: str = Field(..., max_length=200)
    dataset_path: Optional[str] = None
    dataset_size: int = 0
    config: Dict[str, Any] = {
        "learning_rate": 2e-5,
        "epochs": 3,
        "batch_size": 8,
        "lora_rank": 16,
    }


class TrainingJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: UUID
    user_id: UUID
    model_name: str
    base_model: str
    dataset_name: str
    dataset_path: Optional[str] = None
    dataset_size: int
    status: str
    progress: float
    config: Dict[str, Any] = {}
    metrics: Dict[str, Any] = {}
    result_model_path: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class TrainingJobListResponse(BaseModel):
    jobs: List[TrainingJobResponse]
    total: int
    page: int
    page_size: int


class FineTunedModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: UUID
    training_job_id: UUID
    user_id: UUID
    name: str
    base_model: str
    model_path: Optional[str] = None
    description: Optional[str] = None
    performance_metrics: Dict[str, Any] = {}
    is_published: bool
    downloads: int
    created_at: datetime


class FineTunedModelListResponse(BaseModel):
    models: List[FineTunedModelResponse]
    total: int
    page: int
    page_size: int
