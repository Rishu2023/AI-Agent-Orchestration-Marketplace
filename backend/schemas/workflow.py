from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: str = "[]"
    edges: str = "[]"


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[str] = None
    edges: Optional[str] = None


class WorkflowResponse(WorkflowBase):
    id: int
    creator_id: int
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}
