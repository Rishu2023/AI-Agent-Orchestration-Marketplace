import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.economy import CreditAccount, CreditTransaction


def get_or_create_account(db: Session, user_id: uuid.UUID) -> CreditAccount:
    account = db.query(CreditAccount).filter(CreditAccount.user_id == user_id).first()
    if not account:
        account = CreditAccount(user_id=user_id)
        db.add(account)
        db.commit()
        db.refresh(account)
    return account


def get_balance(db: Session, user_id: uuid.UUID) -> float:
    account = get_or_create_account(db, user_id)
    return account.balance


def add_credits(
    db: Session,
    user_id: uuid.UUID,
    amount: float,
    transaction_type: str = "bonus",
    description: str = "",
) -> CreditTransaction:
    account = get_or_create_account(db, user_id)
    account.balance += amount
    account.total_earned += amount

    transaction = CreditTransaction(
        account_id=account.id,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def spend_credits(
    db: Session,
    user_id: uuid.UUID,
    amount: float,
    description: str = "",
) -> Optional[CreditTransaction]:
    account = get_or_create_account(db, user_id)
    if account.balance < amount:
        return None

    account.balance -= amount
    account.total_spent += amount

    transaction = CreditTransaction(
        account_id=account.id,
        amount=amount,
        transaction_type="spent",
        description=description,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transactions(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[CreditTransaction], int]:
    account = get_or_create_account(db, user_id)
    query = db.query(CreditTransaction).filter(CreditTransaction.account_id == account.id)
    total = query.count()
    transactions = (
        query.order_by(desc(CreditTransaction.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return transactions, total


def get_leaderboard(db: Session, limit: int = 10) -> List[CreditAccount]:
    return (
        db.query(CreditAccount)
        .order_by(desc(CreditAccount.total_earned))
        .limit(limit)
        .all()
    )
