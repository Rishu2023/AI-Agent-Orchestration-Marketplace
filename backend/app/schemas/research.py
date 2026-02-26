from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ResearchPaperResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    authors: List[str] = []
    abstract: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    summary: Optional[str] = None
    tags: List[str] = []
    relevance_score: float
    auto_agent_created: bool
    created_at: datetime


class ResearchPaperListResponse(BaseModel):
    papers: List[ResearchPaperResponse]
    total: int


class TrendingModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    provider: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    stars: int
    trend_score: float
    discovered_at: datetime


class TrendingModelListResponse(BaseModel):
    models: List[TrendingModelResponse]
    total: int


class ResearchScanResponse(BaseModel):
    papers_found: int
    models_found: int
    agents_created: int
    message: str
