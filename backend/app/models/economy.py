import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Uuid
from app.database.session import Base


class CreditAccount(Base):
    __tablename__ = "credit_accounts"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=100.0)
    total_earned = Column(Float, default=0.0)
    total_spent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    account_id = Column(Uuid, ForeignKey("credit_accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    description = Column(Text)
    reference_id = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)
