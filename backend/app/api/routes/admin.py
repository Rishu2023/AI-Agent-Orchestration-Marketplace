import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserResponse
from app.schemas.admin import (
    AuditLogResponse,
    AuditLogListResponse,
    AnnouncementCreate,
    AnnouncementResponse,
    KillSwitchCreate,
    KillSwitchResponse,
    BanUserRequest,
    CreditAdjustRequest,
    BenchmarkOverrideRequest,
)
from app.schemas.economy import CreditAccountResponse
from app.schemas.benchmark import BenchmarkResultResponse
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=dict)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    users, total = admin_service.get_all_users(db, page, page_size)
    return {
        "users": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/users/{user_id}/ban", response_model=UserResponse)
def ban_user(
    user_id: uuid.UUID,
    request: BanUserRequest,
    db: Session = Depends(get_db),
):
    user = admin_service.ban_user(db, user_id, request.admin_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.post("/users/{user_id}/unban", response_model=UserResponse)
def unban_user(
    user_id: uuid.UUID,
    request: BanUserRequest,
    db: Session = Depends(get_db),
):
    user = admin_service.unban_user(db, user_id, request.admin_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.delete("/agents/{agent_id}")
def remove_agent(
    agent_id: uuid.UUID,
    admin_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    agent = admin_service.remove_agent(db, agent_id, admin_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"detail": "Agent removed"}


@router.post("/credits/adjust", response_model=CreditAccountResponse)
def adjust_credits(request: CreditAdjustRequest, db: Session = Depends(get_db)):
    account = admin_service.adjust_credits(db, request.user_id, request.amount, request.admin_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return CreditAccountResponse.model_validate(account)


@router.post("/announcements", response_model=AnnouncementResponse, status_code=201)
def create_announcement(request: AnnouncementCreate, db: Session = Depends(get_db)):
    announcement = admin_service.create_announcement(
        db=db,
        title=request.title,
        content=request.content,
        announcement_type=request.announcement_type,
        admin_id=request.admin_id,
        expires_at=request.expires_at,
    )
    return AnnouncementResponse.model_validate(announcement)


@router.get("/announcements", response_model=list[AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    announcements = admin_service.get_announcements(db)
    return [AnnouncementResponse.model_validate(a) for a in announcements]


@router.post("/kill-switch", response_model=KillSwitchResponse, status_code=201)
def activate_kill_switch(request: KillSwitchCreate, db: Session = Depends(get_db)):
    switch = admin_service.activate_kill_switch(
        db=db,
        target_type=request.target_type,
        target_id=request.target_id,
        reason=request.reason,
        admin_id=request.admin_id,
    )
    return KillSwitchResponse.model_validate(switch)


@router.delete("/kill-switch/{switch_id}", response_model=KillSwitchResponse)
def deactivate_kill_switch(
    switch_id: uuid.UUID,
    admin_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    switch = admin_service.deactivate_kill_switch(db, switch_id, admin_id)
    if not switch:
        raise HTTPException(status_code=404, detail="Kill switch not found")
    return KillSwitchResponse.model_validate(switch)


@router.get("/audit-log", response_model=AuditLogListResponse)
def get_audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    logs, total = admin_service.get_audit_log(db, page, page_size)
    return AuditLogListResponse(
        logs=[AuditLogResponse.model_validate(log) for log in logs],
        total=total,
        page=page,
        page_size=page_size,
    )
