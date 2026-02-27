import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Float, JSON, Uuid
from sqlalchemy.orm import relationship
from app.database.session import Base


class FederationNode(Base):
    __tablename__ = "federation_nodes"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    url = Column(String(500), nullable=False, unique=True)
    api_key = Column(String(500), nullable=False)
    location = Column(JSON, default=dict)
    status = Column(String(20), default="pending")
    agent_count = Column(Integer, default=0)
    last_heartbeat = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    agents = relationship("FederatedAgent", back_populates="node", cascade="all, delete-orphan")


class FederatedAgent(Base):
    __tablename__ = "federated_agents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    node_id = Column(Uuid, ForeignKey("federation_nodes.id"), nullable=False)
    remote_agent_id = Column(String(200), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    performance_score = Column(Float, default=0.0)
    origin_server = Column(String(500))
    synced_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    node = relationship("FederationNode", back_populates="agents")
