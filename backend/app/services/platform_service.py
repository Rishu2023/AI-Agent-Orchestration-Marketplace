import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.platform_stats import PlatformSnapshot
from app.models.user import User
from app.models.agent import Agent
from app.models.workflow import Workflow, WorkflowExecution
from app.models.economy import CreditAccount
from app.models.federation import FederationNode, FederatedAgent


def get_platform_stats(db: Session) -> dict:
    total_agents = db.query(func.count(Agent.id)).scalar() or 0
    total_federated_agents = db.query(func.count(FederatedAgent.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_workflows = db.query(func.count(Workflow.id)).scalar() or 0

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    executions_today = (
        db.query(func.count(WorkflowExecution.id))
        .filter(WorkflowExecution.started_at >= today_start)
        .scalar() or 0
    )
    executions_week = (
        db.query(func.count(WorkflowExecution.id))
        .filter(WorkflowExecution.started_at >= week_start)
        .scalar() or 0
    )
    executions_month = (
        db.query(func.count(WorkflowExecution.id))
        .filter(WorkflowExecution.started_at >= month_start)
        .scalar() or 0
    )

    total_credits_supply = db.query(func.sum(CreditAccount.balance)).scalar() or 0.0
    credits_velocity = db.query(func.sum(CreditAccount.total_spent)).scalar() or 0.0
    federation_nodes_count = db.query(func.count(FederationNode.id)).scalar() or 0

    return {
        "total_agents": total_agents,
        "total_federated_agents": total_federated_agents,
        "total_users": total_users,
        "total_workflows": total_workflows,
        "executions_today": executions_today,
        "executions_week": executions_week,
        "executions_month": executions_month,
        "total_credits_supply": total_credits_supply,
        "credits_velocity": credits_velocity,
        "federation_nodes_count": federation_nodes_count,
        "top_models": [],
        "top_agents": [],
        "benchmark_trends": [],
    }


def create_snapshot(db: Session) -> PlatformSnapshot:
    stats = get_platform_stats(db)
    snapshot = PlatformSnapshot(**stats)
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def get_snapshot_history(
    db: Session,
    days: int = 30,
) -> Tuple[List[PlatformSnapshot], int]:
    since = datetime.utcnow() - timedelta(days=days)
    query = db.query(PlatformSnapshot).filter(PlatformSnapshot.snapshot_at >= since)
    total = query.count()
    snapshots = query.order_by(desc(PlatformSnapshot.snapshot_at)).all()
    return snapshots, total
