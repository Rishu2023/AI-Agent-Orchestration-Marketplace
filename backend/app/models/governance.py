import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Uuid
from app.database.session import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    proposal_type = Column(String(50), nullable=False)
    proposed_by = Column(Uuid, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="active")
    votes_for = Column(Integer, default=0)
    votes_against = Column(Integer, default=0)
    voting_deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    proposal_id = Column(Uuid, ForeignKey("proposals.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
