import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database.session import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    agent_id = Column(Uuid, ForeignKey("agents.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    agent = relationship("Agent", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
