import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.economy import (
    CreditAccountResponse,
    CreditTransactionResponse,
    TransactionListResponse,
    AddCreditsRequest,
    SpendCreditsRequest,
    LeaderboardEntry,
    LeaderboardResponse,
)
from app.services import economy_service

router = APIRouter(prefix="/economy", tags=["economy"])


@router.get("/balance/{user_id}", response_model=CreditAccountResponse)
def get_balance(user_id: uuid.UUID, db: Session = Depends(get_db)):
    account = economy_service.get_or_create_account(db, user_id)
    return CreditAccountResponse.model_validate(account)


@router.get("/transactions/{user_id}", response_model=TransactionListResponse)
def get_transactions(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    transactions, total = economy_service.get_transactions(db, user_id, page, page_size)
    return TransactionListResponse(
        transactions=[CreditTransactionResponse.model_validate(t) for t in transactions],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/credits/add", response_model=CreditTransactionResponse, status_code=201)
def add_credits(
    request: AddCreditsRequest,
    db: Session = Depends(get_db),
):
    transaction = economy_service.add_credits(
        db=db,
        user_id=request.user_id,
        amount=request.amount,
        transaction_type=request.transaction_type,
        description=request.description,
    )
    return CreditTransactionResponse.model_validate(transaction)


@router.post("/credits/spend", response_model=CreditTransactionResponse)
def spend_credits(
    request: SpendCreditsRequest,
    db: Session = Depends(get_db),
):
    transaction = economy_service.spend_credits(
        db=db,
        user_id=request.user_id,
        amount=request.amount,
        description=request.description,
    )
    if not transaction:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    return CreditTransactionResponse.model_validate(transaction)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    accounts = economy_service.get_leaderboard(db, limit=limit)
    entries = [
        LeaderboardEntry(
            user_id=a.user_id,
            total_earned=a.total_earned,
            balance=a.balance,
        )
        for a in accounts
    ]
    return LeaderboardResponse(entries=entries)
