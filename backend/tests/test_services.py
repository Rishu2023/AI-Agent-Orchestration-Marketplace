import pytest
import asyncio
from app.services.execution_service import AgentExecutionService


def test_execution_service_rate_limit():
    service = AgentExecutionService()
    service.max_requests_per_minute = 3

    for _ in range(3):
        assert service.check_rate_limit("user1") is True

    assert service.check_rate_limit("user1") is False
    # Different user should not be rate limited
    assert service.check_rate_limit("user2") is True


def test_execution_service_execute():
    service = AgentExecutionService()
    result = asyncio.get_event_loop().run_until_complete(
        service.execute_agent(
            agent_config={"model_name": "gpt-4", "model_provider": "openai"},
            input_data={"query": "test"},
            user_id="test-user",
        )
    )
    assert result.status == "completed"
    assert result.output is not None
    assert result.execution_id is not None


def test_execution_service_rate_limit_exceeded():
    service = AgentExecutionService()
    service.max_requests_per_minute = 0

    result = asyncio.get_event_loop().run_until_complete(
        service.execute_agent(
            agent_config={},
            input_data={},
            user_id="limited-user",
        )
    )
    assert result.status == "error"
    assert "Rate limit" in result.error
