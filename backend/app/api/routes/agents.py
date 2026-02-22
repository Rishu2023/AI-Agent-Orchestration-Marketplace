import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse,
    AgentListResponse, AgentExecuteRequest, AgentExecuteResponse,
)
from app.services import agent_service
from app.services.execution_service import execution_service

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=AgentListResponse)
def list_agents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    agents, total = agent_service.list_agents(
        db, category=category, search=search, status=status,
        page=page, page_size=page_size,
    )
    return AgentListResponse(
        agents=[AgentResponse.model_validate(a) for a in agents],
        total=total, page=page, page_size=page_size,
    )


@router.get("/featured", response_model=list[AgentResponse])
def get_featured_agents(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    agents = agent_service.get_featured_agents(db, limit=limit)
    return [AgentResponse.model_validate(a) for a in agents]


@router.get("/popular", response_model=list[AgentResponse])
def get_popular_agents(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    agents = agent_service.get_popular_agents(db, limit=limit)
    return [AgentResponse.model_validate(a) for a in agents]


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    agent = agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.model_validate(agent)


@router.post("", response_model=AgentResponse, status_code=201)
def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
):
    # In production, publisher_id would come from authenticated user
    publisher_id = uuid.uuid4()  # Placeholder
    agent = agent_service.create_agent(db, agent_data, publisher_id)
    return AgentResponse.model_validate(agent)


@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: uuid.UUID,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
):
    agent = agent_service.update_agent(db, agent_id, agent_data)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.model_validate(agent)


@router.post("/{agent_id}/publish", response_model=AgentResponse)
def publish_agent(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    agent = agent_service.publish_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse.model_validate(agent)


@router.delete("/{agent_id}", status_code=204)
def delete_agent(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    if not agent_service.delete_agent(db, agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/execute", response_model=AgentExecuteResponse)
async def execute_agent(
    agent_id: uuid.UUID,
    request: AgentExecuteRequest,
    db: Session = Depends(get_db),
):
    agent = agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_config = {
        "system_prompt": agent.system_prompt,
        "model_provider": agent.model_provider,
        "model_name": agent.model_name,
        "tools": agent.tools,
        "parameters": agent.parameters,
    }

    result = await execution_service.execute_agent(
        agent_config=agent_config,
        input_data=request.input,
        user_id=str(agent_id),  # Placeholder
    )

    return AgentExecuteResponse(
        execution_id=result.execution_id,
        status=result.status,
        output=result.output,
        tokens_used=result.tokens_used,
        cost=result.cost,
        duration_ms=result.duration_ms,
    )
