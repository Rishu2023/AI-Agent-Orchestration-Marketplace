from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from database import get_db
from models.agent import Agent
from schemas.agent import AgentResponse, AgentListResponse

router = APIRouter(prefix="/api/v1/marketplace", tags=["marketplace"])

CATEGORIES = [
    "Customer Support",
    "Data Analysis",
    "Content Creation",
    "Code Assistant",
    "Research",
    "Finance",
    "Healthcare",
    "Legal",
    "Marketing",
    "Education",
    "Productivity",
    "Other",
]


@router.get("/categories")
async def list_categories():
    return {"categories": CATEGORIES}


@router.get("/featured", response_model=list[AgentResponse])
async def featured_agents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Agent)
        .where(Agent.is_published == True, Agent.is_featured == True)  # noqa: E712
        .order_by(Agent.rating.desc())
        .limit(6)
    )
    return result.scalars().all()


@router.get("/agents", response_model=AgentListResponse)
async def list_marketplace_agents(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    pricing_type: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    sort_by: str = Query("rating", pattern="^(rating|created_at|execution_count|price)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Agent).where(Agent.is_published == True)  # noqa: E712

    if search:
        query = query.where(
            or_(
                Agent.name.ilike(f"%{search}%"),
                Agent.description.ilike(f"%{search}%"),
            )
        )
    if category:
        query = query.where(Agent.category == category)
    if pricing_type:
        query = query.where(Agent.pricing_type == pricing_type)
    if min_rating is not None:
        query = query.where(Agent.rating >= min_rating)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    sort_col = getattr(Agent, sort_by, Agent.rating)
    query = query.order_by(sort_col.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    agents = result.scalars().all()

    return AgentListResponse(items=list(agents), total=total, page=page, page_size=page_size)


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_marketplace_agent(agent_id: int, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id, Agent.is_published == True)  # noqa: E712
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent
