from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class MemoryStoreRequest(BaseModel):
    agent_id: Optional[UUID] = None
    namespace: str = Field(..., max_length=200)
    key: str = Field(..., max_length=500)
    content: str
    memory_type: str = "episodic"
    metadata_extra: Dict[str, Any] = {}


class MemoryUpdateRequest(BaseModel):
    content: str
    metadata_extra: Optional[Dict[str, Any]] = None


class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    agent_id: Optional[UUID] = None
    namespace: str
    key: str
    content: str
    memory_type: str
    metadata_extra: Dict[str, Any] = {}
    access_count: int = 0
    created_at: datetime
    updated_at: datetime


class MemoryListResponse(BaseModel):
    memories: List[MemoryResponse]
    total: int
    page: int
    page_size: int


class MemorySearchRequest(BaseModel):
    query: str
    namespace: Optional[str] = None
    limit: int = Field(10, ge=1, le=100)


class MemoryStatsResponse(BaseModel):
    total_memories: int
    by_type: Dict[str, int]
    by_namespace: Dict[str, int]
    total_access_count: int


class KnowledgeCreateRequest(BaseModel):
    title: str = Field(..., max_length=500)
    content: str
    source: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    tags: List[str] = []


class KnowledgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    content: str
    source: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime


class KnowledgeSearchResponse(BaseModel):
    results: List[KnowledgeResponse]
    total: int
