from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CreditAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    balance: float
    total_earned: float
    total_spent: float
    created_at: datetime
    updated_at: datetime


class CreditTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    account_id: UUID
    amount: float
    transaction_type: str
    description: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime


class TransactionListResponse(BaseModel):
    transactions: List[CreditTransactionResponse]
    total: int
    page: int
    page_size: int


class AddCreditsRequest(BaseModel):
    user_id: UUID
    amount: float = Field(..., gt=0)
    transaction_type: str = Field(default="bonus", pattern="^(earned|bonus|refund)$")
    description: str = ""


class SpendCreditsRequest(BaseModel):
    user_id: UUID
    amount: float = Field(..., gt=0)
    description: str = ""


class LeaderboardEntry(BaseModel):
    user_id: UUID
    total_earned: float
    balance: float


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
