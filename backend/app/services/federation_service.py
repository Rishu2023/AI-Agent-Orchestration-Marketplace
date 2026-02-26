import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.federation import FederationNode, FederatedAgent
from app.schemas.federation import FederationNodeCreate
import httpx
import logging

logger = logging.getLogger(__name__)


def register_node(db: Session, node_data: FederationNodeCreate) -> FederationNode:
    node = FederationNode(
        name=node_data.name,
        url=node_data.url,
        api_key=node_data.api_key,
        location=node_data.location,
        status="active",
        last_heartbeat=datetime.utcnow(),
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


def sync_agents(db: Session, node_id: uuid.UUID) -> List[FederatedAgent]:
    node = db.query(FederationNode).filter(FederationNode.id == node_id).first()
    if not node:
        return []

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                f"{node.url}/api/v1/agents",
                headers={"Authorization": f"Bearer {node.api_key}"},
            )
            response.raise_for_status()
            remote_agents = response.json().get("agents", [])
    except Exception as e:
        logger.warning("Failed to sync agents from node %s: %s", node.name, e)
        remote_agents = []

    synced = []
    for ra in remote_agents:
        existing = (
            db.query(FederatedAgent)
            .filter(
                FederatedAgent.node_id == node_id,
                FederatedAgent.remote_agent_id == str(ra.get("id", "")),
            )
            .first()
        )
        if existing:
            existing.name = ra.get("name", existing.name)
            existing.description = ra.get("description", existing.description)
            existing.category = ra.get("category", existing.category)
            existing.performance_score = ra.get("average_rating", existing.performance_score)
            existing.synced_at = datetime.utcnow()
            synced.append(existing)
        else:
            federated_agent = FederatedAgent(
                node_id=node_id,
                remote_agent_id=str(ra.get("id", "")),
                name=ra.get("name", "Unknown"),
                description=ra.get("description"),
                category=ra.get("category"),
                performance_score=ra.get("average_rating", 0.0),
                origin_server=node.url,
            )
            db.add(federated_agent)
            synced.append(federated_agent)

    node.agent_count = len(synced)
    node.last_heartbeat = datetime.utcnow()
    db.commit()
    for agent in synced:
        db.refresh(agent)
    return synced


def health_check(db: Session, node_id: uuid.UUID) -> Optional[FederationNode]:
    node = db.query(FederationNode).filter(FederationNode.id == node_id).first()
    if not node:
        return None
    node.last_heartbeat = datetime.utcnow()
    node.status = "active"
    db.commit()
    db.refresh(node)
    return node


def remove_offline_nodes(db: Session) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    offline_nodes = (
        db.query(FederationNode)
        .filter(
            FederationNode.last_heartbeat < cutoff,
            FederationNode.status == "active",
        )
        .all()
    )
    count = 0
    for node in offline_nodes:
        node.status = "inactive"
        count += 1
    db.commit()
    return count


def list_nodes(db: Session) -> List[FederationNode]:
    return db.query(FederationNode).order_by(FederationNode.created_at.desc()).all()


def remove_node(db: Session, node_id: uuid.UUID) -> bool:
    node = db.query(FederationNode).filter(FederationNode.id == node_id).first()
    if not node:
        return False
    db.delete(node)
    db.commit()
    return True


def list_federated_agents(db: Session) -> List[FederatedAgent]:
    return db.query(FederatedAgent).order_by(FederatedAgent.created_at.desc()).all()
