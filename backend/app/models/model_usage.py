import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Uuid, ForeignKey
from app.database.session import Base


class ModelUsage(Base):
    __tablename__ = "model_usage"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    agent_id = Column(Uuid, ForeignKey("agents.id"), nullable=True)
    user_id = Column(Uuid, nullable=False)
    model_provider = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)
