import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.billing import ApiKey, BillingPlan, Subscription, UsageRecord


TIER_RATE_LIMITS = {"free": 100, "pro": 1000, "enterprise": 10000}


def create_api_key(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    tier: str = "free",
) -> tuple:
    raw_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    rate_limit = TIER_RATE_LIMITS.get(tier, 100)

    api_key = ApiKey(
        user_id=user_id,
        key_hash=key_hash,
        name=name,
        tier=tier,
        rate_limit=rate_limit,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return api_key, raw_key


def validate_api_key(db: Session, key: str) -> Optional[ApiKey]:
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    api_key = (
        db.query(ApiKey)
        .filter(ApiKey.key_hash == key_hash, ApiKey.is_active.is_(True))
        .first()
    )
    if not api_key:
        return None

    if api_key.expires_at and datetime.utcnow() > api_key.expires_at:
        return None

    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_usage = (
        db.query(func.count(UsageRecord.id))
        .filter(
            UsageRecord.api_key_id == api_key.id,
            UsageRecord.created_at >= one_hour_ago,
        )
        .scalar()
    )
    if recent_usage >= api_key.rate_limit:
        return None

    api_key.last_used_at = datetime.utcnow()
    api_key.usage_count += 1
    db.commit()
    return api_key


def list_api_keys(db: Session, user_id: uuid.UUID) -> List[ApiKey]:
    return (
        db.query(ApiKey)
        .filter(ApiKey.user_id == user_id)
        .order_by(desc(ApiKey.created_at))
        .all()
    )


def revoke_api_key(db: Session, key_id: uuid.UUID) -> Optional[ApiKey]:
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if not api_key:
        return None
    api_key.is_active = False
    db.commit()
    db.refresh(api_key)
    return api_key


def get_plans(db: Session) -> List[BillingPlan]:
    return db.query(BillingPlan).filter(BillingPlan.is_active.is_(True)).all()


def subscribe(
    db: Session,
    user_id: uuid.UUID,
    plan_id: uuid.UUID,
) -> Optional[Subscription]:
    plan = db.query(BillingPlan).filter(BillingPlan.id == plan_id).first()
    if not plan:
        return None

    existing = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id, Subscription.status == "active")
        .first()
    )
    if existing:
        existing.status = "cancelled"

    subscription = Subscription(
        user_id=user_id,
        plan_id=plan_id,
        current_period_start=datetime.utcnow(),
        current_period_end=datetime.utcnow() + timedelta(days=30),
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def get_subscription(db: Session, user_id: uuid.UUID) -> Optional[Subscription]:
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id, Subscription.status == "active")
        .first()
    )


def record_usage(
    db: Session,
    user_id: uuid.UUID,
    api_key_id: uuid.UUID,
    endpoint: str,
    method: str,
    tokens: int = 0,
    cost: float = 0.0,
) -> UsageRecord:
    record = UsageRecord(
        user_id=user_id,
        api_key_id=api_key_id,
        endpoint=endpoint,
        method=method,
        tokens_used=tokens,
        cost=cost,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_usage(
    db: Session,
    user_id: uuid.UUID,
    period: str = "month",
) -> dict:
    period_map = {"day": 1, "week": 7, "month": 30}
    days = period_map.get(period, 30)
    since = datetime.utcnow() - timedelta(days=days)

    records = (
        db.query(UsageRecord)
        .filter(UsageRecord.user_id == user_id, UsageRecord.created_at >= since)
        .order_by(desc(UsageRecord.created_at))
        .all()
    )

    total_tokens = sum(r.tokens_used for r in records)
    total_cost = sum(r.cost for r in records)

    return {
        "user_id": user_id,
        "total_requests": len(records),
        "total_tokens": total_tokens,
        "total_cost": total_cost,
        "records": records,
    }
