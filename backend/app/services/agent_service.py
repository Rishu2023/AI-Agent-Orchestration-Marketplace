import uuid
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.agent import Agent, AgentStatus
from app.schemas.agent import AgentCreate, AgentUpdate
from app.services.utils import generate_slug


def create_agent(db: Session, agent_data: AgentCreate, publisher_id: uuid.UUID) -> Agent:
    agent = Agent(
        name=agent_data.name,
        slug=generate_slug(agent_data.name),
        description=agent_data.description,
        long_description=agent_data.long_description,
        category=agent_data.category,
        tags=agent_data.tags,
        system_prompt=agent_data.system_prompt,
        model_provider=agent_data.model_provider,
        model_name=agent_data.model_name,
        tools=agent_data.tools,
        parameters=agent_data.parameters,
        input_schema=agent_data.input_schema,
        output_schema=agent_data.output_schema,
        pricing_model=agent_data.pricing_model,
        price=agent_data.price,
        publisher_id=publisher_id,
        status=AgentStatus.DRAFT.value,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


def get_agent(db: Session, agent_id: uuid.UUID) -> Optional[Agent]:
    return db.query(Agent).filter(Agent.id == agent_id).first()


def get_agent_by_slug(db: Session, slug: str) -> Optional[Agent]:
    return db.query(Agent).filter(Agent.slug == slug).first()


def list_agents(
    db: Session,
    category: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Agent], int]:
    query = db.query(Agent)

    if status:
        query = query.filter(Agent.status == status)
    else:
        query = query.filter(Agent.status == AgentStatus.PUBLISHED.value)

    if category:
        query = query.filter(Agent.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Agent.name.ilike(search_term),
                Agent.description.ilike(search_term),
            )
        )

    total = query.count()
    agents = query.order_by(Agent.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return agents, total


def update_agent(db: Session, agent_id: uuid.UUID, agent_data: AgentUpdate) -> Optional[Agent]:
    agent = get_agent(db, agent_id)
    if not agent:
        return None

    update_data = agent_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)

    db.commit()
    db.refresh(agent)
    return agent


def publish_agent(db: Session, agent_id: uuid.UUID) -> Optional[Agent]:
    agent = get_agent(db, agent_id)
    if not agent:
        return None

    agent.status = AgentStatus.PUBLISHED.value
    agent.published_at = datetime.utcnow()
    db.commit()
    db.refresh(agent)
    return agent


def delete_agent(db: Session, agent_id: uuid.UUID) -> bool:
    agent = get_agent(db, agent_id)
    if not agent:
        return False

    db.delete(agent)
    db.commit()
    return True


def get_featured_agents(db: Session, limit: int = 10) -> List[Agent]:
    return (
        db.query(Agent)
        .filter(Agent.status == AgentStatus.PUBLISHED.value, Agent.is_featured.is_(True))
        .order_by(Agent.average_rating.desc())
        .limit(limit)
        .all()
    )


def get_popular_agents(db: Session, limit: int = 10) -> List[Agent]:
    return (
        db.query(Agent)
        .filter(Agent.status == AgentStatus.PUBLISHED.value)
        .order_by(Agent.total_runs.desc())
        .limit(limit)
        .all()
    )
