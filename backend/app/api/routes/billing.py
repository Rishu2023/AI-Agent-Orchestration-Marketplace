import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.billing import (
    ApiKeyCreate,
    ApiKeyResponse,
    ApiKeyCreatedResponse,
    BillingPlanResponse,
    SubscribeRequest,
    SubscriptionResponse,
    UsageRecordResponse,
    UsageStatsResponse,
)
from app.services import billing_service

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/api-keys", response_model=ApiKeyCreatedResponse, status_code=201)
def create_api_key(request: ApiKeyCreate, db: Session = Depends(get_db)):
    api_key, raw_key = billing_service.create_api_key(
        db=db,
        user_id=request.user_id,
        name=request.name,
        tier=request.tier,
    )
    return ApiKeyCreatedResponse(
        id=api_key.id,
        user_id=api_key.user_id,
        name=api_key.name,
        tier=api_key.tier,
        rate_limit=api_key.rate_limit,
        raw_key=raw_key,
        created_at=api_key.created_at,
    )


@router.get("/api-keys/{user_id}", response_model=list[ApiKeyResponse])
def list_api_keys(user_id: uuid.UUID, db: Session = Depends(get_db)):
    keys = billing_service.list_api_keys(db, user_id)
    return [ApiKeyResponse.model_validate(k) for k in keys]


@router.delete("/api-keys/{key_id}", response_model=ApiKeyResponse)
def revoke_api_key(key_id: uuid.UUID, db: Session = Depends(get_db)):
    api_key = billing_service.revoke_api_key(db, key_id)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    return ApiKeyResponse.model_validate(api_key)


@router.get("/plans", response_model=list[BillingPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    plans = billing_service.get_plans(db)
    return [BillingPlanResponse.model_validate(p) for p in plans]


@router.post("/subscribe", response_model=SubscriptionResponse, status_code=201)
def subscribe(request: SubscribeRequest, db: Session = Depends(get_db)):
    subscription = billing_service.subscribe(db, request.user_id, request.plan_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Plan not found")
    return SubscriptionResponse.model_validate(subscription)


@router.get("/subscription/{user_id}", response_model=SubscriptionResponse)
def get_subscription(user_id: uuid.UUID, db: Session = Depends(get_db)):
    subscription = billing_service.get_subscription(db, user_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription")
    return SubscriptionResponse.model_validate(subscription)


@router.get("/usage/{user_id}", response_model=UsageStatsResponse)
def get_usage(
    user_id: uuid.UUID,
    period: str = Query("month", pattern="^(day|week|month)$"),
    db: Session = Depends(get_db),
):
    usage = billing_service.get_usage(db, user_id, period)
    return UsageStatsResponse(
        user_id=usage["user_id"],
        total_requests=usage["total_requests"],
        total_tokens=usage["total_tokens"],
        total_cost=usage["total_cost"],
        records=[UsageRecordResponse.model_validate(r) for r in usage["records"]],
    )
