import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.agent import Agent
from models.execution import Execution
from schemas.execution import ExecutionCreate, ExecutionResponse
from auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/executions", tags=["executions"])


def _mock_llm_response(system_prompt: str, user_input: str) -> dict:
    """Mock LLM response - replace with real OpenAI/Anthropic call in production."""
    return {
        "response": f"[Mock LLM] Processed your request: '{user_input[:100]}'. "
                    f"Agent is ready for real LLM integration.",
        "model": "mock-gpt-4",
        "finish_reason": "stop",
    }


@router.get("", response_model=list[ExecutionResponse])
async def list_executions(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Execution)
        .where(Execution.user_id == current_user.id)
        .order_by(Execution.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{execution_id}", response_model=ExecutionResponse)
async def get_execution(
    execution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Execution).where(Execution.id == execution_id, Execution.user_id == current_user.id)
    )
    execution = result.scalar_one_or_none()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution


@router.post("/agents/{agent_id}/run", response_model=ExecutionResponse, status_code=201)
async def run_agent(
    agent_id: int,
    data: ExecutionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_result = await db.execute(select(Agent).where(Agent.id == agent_id, Agent.is_published == True))  # noqa: E712
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or not published")

    user_input = data.input_data or ""
    try:
        input_obj = json.loads(user_input) if user_input else {}
        prompt_text = input_obj.get("prompt", user_input)
    except json.JSONDecodeError:
        prompt_text = user_input

    llm_result = _mock_llm_response(agent.system_prompt, str(prompt_text))
    tokens = 150
    cost = round(agent.price if agent.pricing_type == "per_use" else tokens * 0.000002, 6)

    execution = Execution(
        agent_id=agent_id,
        user_id=current_user.id,
        status="completed",
        input_data=data.input_data,
        output_data=json.dumps(llm_result),
        tokens_used=tokens,
        cost=cost,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(execution)
    agent.execution_count = (agent.execution_count or 0) + 1
    await db.commit()
    await db.refresh(execution)
    return execution
