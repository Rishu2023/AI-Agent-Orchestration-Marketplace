import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, Uuid, JSON
from app.database.session import Base


class PlatformSnapshot(Base):
    __tablename__ = "platform_snapshots"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    total_agents = Column(Integer, default=0)
    total_federated_agents = Column(Integer, default=0)
    total_users = Column(Integer, default=0)
    total_workflows = Column(Integer, default=0)
    executions_today = Column(Integer, default=0)
    executions_week = Column(Integer, default=0)
    executions_month = Column(Integer, default=0)
    total_credits_supply = Column(Float, default=0.0)
    credits_velocity = Column(Float, default=0.0)
    federation_nodes_count = Column(Integer, default=0)
    top_models = Column(JSON, default=list)
    top_agents = Column(JSON, default=list)
    benchmark_trends = Column(JSON, default=list)
    snapshot_at = Column(DateTime, default=datetime.utcnow)
