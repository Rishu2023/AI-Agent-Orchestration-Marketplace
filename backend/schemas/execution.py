from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExecutionCreate(BaseModel):
    input_data: Optional[str] = None  # JSON string


class ExecutionResponse(BaseModel):
    id: int
    agent_id: Optional[int] = None
    workflow_id: Optional[int] = None
    user_id: int
    status: str
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    error_message: Optional[str] = None
    tokens_used: int
    cost: float
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
