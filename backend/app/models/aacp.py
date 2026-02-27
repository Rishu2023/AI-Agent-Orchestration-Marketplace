import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Uuid
from app.database.session import Base


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    sender_agent_id = Column(Uuid, nullable=False)
    receiver_agent_id = Column(Uuid, nullable=False)
    message_type = Column(String(20), nullable=False, default="request")
    content = Column(JSON, nullable=False)
    correlation_id = Column(String(200))
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
