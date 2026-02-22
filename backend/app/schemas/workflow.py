from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class WorkflowStepCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    step_type: str
    position: int
    agent_id: Optional[UUID] = None
    config: Dict[str, Any] = {}
    input_mapping: Dict[str, Any] = {}
    output_mapping: Dict[str, Any] = {}
    condition: Optional[Dict[str, Any]] = None
    position_x: float = 0.0
    position_y: float = 0.0
    next_step_id: Optional[UUID] = None
    on_failure_step_id: Optional[UUID] = None


class WorkflowStepResponse(WorkflowStepCreate):
    id: UUID
    workflow_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    steps: List[WorkflowStepCreate] = []
    variables: Dict[str, Any] = {}
    is_template: bool = False
    is_public: bool = False


class WorkflowUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    steps: Optional[List[WorkflowStepCreate]] = None
    variables: Optional[Dict[str, Any]] = None
    is_template: Optional[bool] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    owner_id: UUID
    status: str
    is_template: bool
    is_public: bool
    variables: Dict[str, Any] = {}
    total_runs: int
    average_duration: float
    steps: List[WorkflowStepResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]
    total: int
    page: int
    page_size: int


class WorkflowExecuteRequest(BaseModel):
    input_data: Dict[str, Any] = {}
    parameters: Optional[Dict[str, Any]] = None


class WorkflowExecutionResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    status: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    current_step: int
    step_results: List[Dict[str, Any]] = []
    error_message: Optional[str] = None
    total_cost: float = 0.0
    total_tokens: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
