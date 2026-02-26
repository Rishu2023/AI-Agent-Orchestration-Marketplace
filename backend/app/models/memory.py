import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON, Uuid
from app.database.session import Base


class AgentMemory(Base):
    __tablename__ = "agent_memories"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    agent_id = Column(Uuid, nullable=True, index=True)
    namespace = Column(String(200), nullable=False, index=True)
    key = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, default=list)
    memory_type = Column(String(20), nullable=False, default="episodic")
    metadata_extra = Column(JSON, default=dict)
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(500))
    category = Column(String(100), index=True)
    embedding = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
