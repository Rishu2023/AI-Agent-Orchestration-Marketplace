import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, Uuid
from app.database.session import Base


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    authors = Column(JSON, default=list)
    abstract = Column(Text)
    source = Column(String(50), nullable=False)
    source_url = Column(String(500))
    summary = Column(Text)
    tags = Column(JSON, default=list)
    relevance_score = Column(Float, default=0.0)
    auto_agent_created = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrendingModel(Base):
    __tablename__ = "trending_models"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    provider = Column(String(100))
    description = Column(Text)
    source = Column(String(100))
    source_url = Column(String(500))
    stars = Column(Integer, default=0)
    trend_score = Column(Float, default=0.0)
    discovered_at = Column(DateTime, default=datetime.utcnow)
