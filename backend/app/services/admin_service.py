import uuid
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.admin import AuditLog, PlatformAnnouncement, EmergencyKillSwitch
from app.models.user import User
from app.models.agent import Agent
from app.models.economy import CreditAccount
from app.models.benchmark import BenchmarkResult


def log_action(
    db: Session,
    admin_id: uuid.UUID,
    action: str,
    target_type: str,
    target_id: str,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_all_users(
    db: Session,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[User], int]:
    query = db.query(User)
    total = query.count()
    users = (
        query.order_by(desc(User.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return users, total


def ban_user(
    db: Session,
    user_id: uuid.UUID,
    admin_id: uuid.UUID,
) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.is_active = False
    log_action(db, admin_id, "ban_user", "user", str(user_id))
    db.commit()
    db.refresh(user)
    return user


def unban_user(
    db: Session,
    user_id: uuid.UUID,
    admin_id: uuid.UUID,
) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.is_active = True
    log_action(db, admin_id, "unban_user", "user", str(user_id))
    db.commit()
    db.refresh(user)
    return user


def remove_agent(
    db: Session,
    agent_id: uuid.UUID,
    admin_id: uuid.UUID,
) -> Optional[Agent]:
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        return None
    log_action(db, admin_id, "remove_agent", "agent", str(agent_id))
    db.delete(agent)
    db.commit()
    return agent


def adjust_credits(
    db: Session,
    user_id: uuid.UUID,
    amount: float,
    admin_id: uuid.UUID,
) -> Optional[CreditAccount]:
    account = db.query(CreditAccount).filter(CreditAccount.user_id == user_id).first()
    if not account:
        account = CreditAccount(user_id=user_id)
        db.add(account)
        db.flush()
    account.balance += amount
    log_action(
        db, admin_id, "adjust_credits", "credit", str(user_id),
        details={"amount": amount, "new_balance": account.balance},
    )
    db.commit()
    db.refresh(account)
    return account


def create_announcement(
    db: Session,
    title: str,
    content: str,
    announcement_type: str,
    admin_id: uuid.UUID,
    expires_at: Optional[datetime] = None,
) -> PlatformAnnouncement:
    announcement = PlatformAnnouncement(
        title=title,
        content=content,
        announcement_type=announcement_type,
        created_by=admin_id,
        expires_at=expires_at,
    )
    db.add(announcement)
    log_action(db, admin_id, "create_announcement", "announcement", str(announcement.id))
    db.commit()
    db.refresh(announcement)
    return announcement


def get_announcements(db: Session) -> List[PlatformAnnouncement]:
    return (
        db.query(PlatformAnnouncement)
        .filter(PlatformAnnouncement.is_active.is_(True))
        .order_by(desc(PlatformAnnouncement.created_at))
        .all()
    )


def activate_kill_switch(
    db: Session,
    target_type: str,
    target_id: Optional[uuid.UUID],
    reason: str,
    admin_id: uuid.UUID,
) -> EmergencyKillSwitch:
    switch = EmergencyKillSwitch(
        target_type=target_type,
        target_id=target_id,
        reason=reason,
        activated_by=admin_id,
    )
    db.add(switch)
    log_action(
        db, admin_id, "activate_kill_switch", target_type,
        str(target_id) if target_id else "global",
        details={"reason": reason},
    )
    db.commit()
    db.refresh(switch)
    return switch


def deactivate_kill_switch(
    db: Session,
    switch_id: uuid.UUID,
    admin_id: uuid.UUID,
) -> Optional[EmergencyKillSwitch]:
    switch = db.query(EmergencyKillSwitch).filter(EmergencyKillSwitch.id == switch_id).first()
    if not switch:
        return None
    switch.is_active = False
    switch.deactivated_at = datetime.utcnow()
    log_action(db, admin_id, "deactivate_kill_switch", switch.target_type, str(switch_id))
    db.commit()
    db.refresh(switch)
    return switch


def get_audit_log(
    db: Session,
    page: int = 1,
    page_size: int = 50,
) -> Tuple[List[AuditLog], int]:
    query = db.query(AuditLog)
    total = query.count()
    logs = (
        query.order_by(desc(AuditLog.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return logs, total


def override_benchmark(
    db: Session,
    result_id: uuid.UUID,
    scores: Dict[str, float],
    admin_id: uuid.UUID,
) -> Optional[BenchmarkResult]:
    result = db.query(BenchmarkResult).filter(BenchmarkResult.id == result_id).first()
    if not result:
        return None
    for key, value in scores.items():
        if hasattr(result, key):
            setattr(result, key, value)
    log_action(
        db, admin_id, "override_benchmark", "benchmark", str(result_id),
        details={"scores": scores},
    )
    db.commit()
    db.refresh(result)
    return result
