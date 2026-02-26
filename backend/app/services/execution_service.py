"""
Agent execution service - handles running agents with multi-model support.
Routes to OpenAI, Anthropic, Mistral, Groq, or local Ollama based on config.
Falls back to simulated response if no API keys are configured.
"""
import uuid
import time
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Cost per 1K tokens (input/output) by model
MODEL_COSTS: Dict[str, Dict[str, float]] = {
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
    "claude-3-sonnet-20240229": {"input": 0.003, "output": 0.015},
    "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
    "mistral-large-latest": {"input": 0.004, "output": 0.012},
    "mistral-medium-latest": {"input": 0.0027, "output": 0.0081},
    "mistral-small-latest": {"input": 0.001, "output": 0.003},
    "llama-3.1-70b-versatile": {"input": 0.00059, "output": 0.00079},
    "llama-3.1-8b-instant": {"input": 0.00005, "output": 0.00008},
    "mixtral-8x7b-32768": {"input": 0.00024, "output": 0.00024},
}

PROVIDER_MODELS: Dict[str, List[str]] = {
    "openai": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    "anthropic": [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ],
    "mistral": [
        "mistral-large-latest",
        "mistral-medium-latest",
        "mistral-small-latest",
    ],
    "groq": [
        "llama-3.1-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
    ],
    "ollama": [],
}


class ExecutionResult:
    def __init__(
        self,
        execution_id: str,
        status: str,
        output: Optional[Dict[str, Any]] = None,
        tokens_used: int = 0,
        cost: float = 0.0,
        duration_ms: int = 0,
        error: Optional[str] = None,
    ):
        self.execution_id = execution_id
        self.status = status
        self.output = output
        self.tokens_used = tokens_used
        self.cost = cost
        self.duration_ms = duration_ms
        self.error = error


class ModelRouter:
    """Selects the best model based on task requirements and preferences."""

    TASK_MODEL_MAP: Dict[str, Dict[str, str]] = {
        "coding": {"provider": "openai", "model": "gpt-4"},
        "analysis": {"provider": "anthropic", "model": "claude-3-sonnet-20240229"},
        "research": {"provider": "openai", "model": "gpt-4-turbo"},
        "writing": {"provider": "anthropic", "model": "claude-3-opus-20240229"},
        "creative": {"provider": "anthropic", "model": "claude-3-opus-20240229"},
        "customer_support": {"provider": "groq", "model": "llama-3.1-70b-versatile"},
        "data_processing": {"provider": "mistral", "model": "mistral-large-latest"},
    }

    SPEED_MODELS: List[Dict[str, str]] = [
        {"provider": "groq", "model": "llama-3.1-8b-instant"},
        {"provider": "groq", "model": "llama-3.1-70b-versatile"},
        {"provider": "mistral", "model": "mistral-small-latest"},
        {"provider": "openai", "model": "gpt-3.5-turbo"},
    ]

    COST_MODELS: List[Dict[str, str]] = [
        {"provider": "groq", "model": "llama-3.1-8b-instant"},
        {"provider": "groq", "model": "mixtral-8x7b-32768"},
        {"provider": "anthropic", "model": "claude-3-haiku-20240307"},
        {"provider": "mistral", "model": "mistral-small-latest"},
        {"provider": "openai", "model": "gpt-3.5-turbo"},
    ]

    def _provider_available(self, provider: str) -> bool:
        key_map = {
            "openai": settings.openai_api_key,
            "anthropic": settings.anthropic_api_key,
            "mistral": settings.mistral_api_key,
            "groq": settings.groq_api_key,
            "ollama": settings.ollama_base_url,
        }
        return bool(key_map.get(provider))

    def select_model(
        self,
        task_type: Optional[str] = None,
        preferred_provider: Optional[str] = None,
        preferred_model: Optional[str] = None,
        optimize_for: str = "quality",
    ) -> Optional[Dict[str, str]]:
        """Select best available model. Returns None if no providers configured."""
        if preferred_provider and preferred_model:
            if self._provider_available(preferred_provider):
                return {"provider": preferred_provider, "model": preferred_model}

        if optimize_for == "speed":
            for candidate in self.SPEED_MODELS:
                if self._provider_available(candidate["provider"]):
                    return candidate

        if optimize_for == "cost":
            for candidate in self.COST_MODELS:
                if self._provider_available(candidate["provider"]):
                    return candidate

        if task_type and task_type in self.TASK_MODEL_MAP:
            candidate = self.TASK_MODEL_MAP[task_type]
            if self._provider_available(candidate["provider"]):
                return candidate

        for provider, models in PROVIDER_MODELS.items():
            if provider == "ollama":
                continue
            if self._provider_available(provider) and models:
                return {"provider": provider, "model": models[0]}

        if self._provider_available("ollama"):
            return {"provider": "ollama", "model": "llama3"}

        return None


class AgentExecutionService:
    """Handles agent execution with safety controls and multi-model routing."""

    def __init__(self):
        self.rate_limits: Dict[str, list] = {}
        self.max_requests_per_minute = 60
        self.max_tokens_per_request = 4096
        self.model_router = ModelRouter()
        self.http_timeout = 120.0

    def check_rate_limit(self, user_id: str) -> bool:
        now = time.time()
        if user_id not in self.rate_limits:
            self.rate_limits[user_id] = []

        self.rate_limits[user_id] = [
            t for t in self.rate_limits[user_id] if now - t < 60
        ]

        if len(self.rate_limits[user_id]) >= self.max_requests_per_minute:
            return False

        self.rate_limits[user_id].append(now)
        return True

    def _calculate_cost(
        self, model_name: str, tokens_input: int, tokens_output: int
    ) -> float:
        costs = MODEL_COSTS.get(model_name, {"input": 0.001, "output": 0.002})
        return (tokens_input / 1000.0) * costs["input"] + (
            tokens_output / 1000.0
        ) * costs["output"]

    async def _execute_openai(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.http_timeout) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            usage = data.get("usage", {})
            return {
                "content": data["choices"][0]["message"]["content"],
                "tokens_input": usage.get("prompt_tokens", 0),
                "tokens_output": usage.get("completion_tokens", 0),
            }

    async def _execute_anthropic(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        system_msg = ""
        chat_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_msg = msg["content"]
            else:
                chat_messages.append(msg)

        body: Dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "messages": chat_messages,
        }
        if system_msg:
            body["system"] = system_msg

        async with httpx.AsyncClient(timeout=self.http_timeout) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json=body,
            )
            response.raise_for_status()
            data = response.json()
            usage = data.get("usage", {})
            content_blocks = data.get("content", [])
            text = content_blocks[0]["text"] if content_blocks else ""
            return {
                "content": text,
                "tokens_input": usage.get("input_tokens", 0),
                "tokens_output": usage.get("output_tokens", 0),
            }

    async def _execute_mistral(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.http_timeout) as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.mistral_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            usage = data.get("usage", {})
            return {
                "content": data["choices"][0]["message"]["content"],
                "tokens_input": usage.get("prompt_tokens", 0),
                "tokens_output": usage.get("completion_tokens", 0),
            }

    async def _execute_groq(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.http_timeout) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            usage = data.get("usage", {})
            return {
                "content": data["choices"][0]["message"]["content"],
                "tokens_input": usage.get("prompt_tokens", 0),
                "tokens_output": usage.get("completion_tokens", 0),
            }

    async def _execute_ollama(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        base_url = settings.ollama_base_url or "http://localhost:11434"
        async with httpx.AsyncClient(timeout=self.http_timeout) as client:
            response = await client.post(
                f"{base_url}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": False,
                    "options": {"num_predict": max_tokens},
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content", "")
            prompt_eval = data.get("prompt_eval_count", 0)
            eval_count = data.get("eval_count", 0)
            return {
                "content": content,
                "tokens_input": prompt_eval,
                "tokens_output": eval_count,
            }

    def _simulate_response(
        self, agent_config: Dict[str, Any], input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "content": f"Agent execution simulated for input: {input_data}",
            "tokens_input": 0,
            "tokens_output": 0,
        }

    async def _call_provider(
        self, provider: str, model: str, messages: List[Dict[str, str]], max_tokens: int
    ) -> Dict[str, Any]:
        provider_map = {
            "openai": self._execute_openai,
            "anthropic": self._execute_anthropic,
            "mistral": self._execute_mistral,
            "groq": self._execute_groq,
            "ollama": self._execute_ollama,
        }
        handler = provider_map.get(provider)
        if handler is None:
            raise ValueError(f"Unsupported provider: {provider}")
        return await handler(model, messages, max_tokens)

    def _record_usage(
        self,
        agent_id: Optional[str],
        user_id: str,
        provider: str,
        model: str,
        tokens_input: int,
        tokens_output: int,
        cost: float,
        latency_ms: int,
        status: str,
        db: Any = None,
    ) -> None:
        if db is None:
            return
        try:
            from app.models.model_usage import ModelUsage

            usage = ModelUsage(
                agent_id=agent_id if agent_id else None,
                user_id=user_id,
                model_provider=provider,
                model_name=model,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost=cost,
                latency_ms=latency_ms,
                status=status,
            )
            db.add(usage)
            db.commit()
        except Exception as exc:
            logger.warning("Failed to record model usage: %s", exc)
            try:
                db.rollback()
            except Exception:
                pass

    async def execute_agent(
        self,
        agent_config: Dict[str, Any],
        input_data: Dict[str, Any],
        user_id: str,
        db: Any = None,
    ) -> ExecutionResult:
        execution_id = str(uuid.uuid4())
        start_time = time.time()

        if not self.check_rate_limit(user_id):
            return ExecutionResult(
                execution_id=execution_id,
                status="error",
                error="Rate limit exceeded. Please try again later.",
            )

        try:
            provider = agent_config.get("model_provider", "openai")
            model = agent_config.get("model_name", "gpt-4")
            system_prompt = agent_config.get("system_prompt", "You are a helpful assistant.")
            task_type = agent_config.get("category")
            optimize_for = agent_config.get("optimize_for", "quality")
            max_tokens = min(
                agent_config.get("max_tokens", self.max_tokens_per_request),
                self.max_tokens_per_request,
            )

            routed = self.model_router.select_model(
                task_type=task_type,
                preferred_provider=provider,
                preferred_model=model,
                optimize_for=optimize_for,
            )

            if routed is None:
                # No API keys configured – fall back to simulated response
                sim = self._simulate_response(agent_config, input_data)
                duration_ms = int((time.time() - start_time) * 1000)
                return ExecutionResult(
                    execution_id=execution_id,
                    status="completed",
                    output={
                        "result": sim["content"],
                        "model": model,
                        "provider": provider,
                    },
                    tokens_used=0,
                    cost=0.0,
                    duration_ms=duration_ms,
                )

            provider = routed["provider"]
            model = routed["model"]

            user_message = input_data.get("query", input_data.get("input", str(input_data)))
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ]

            result = await self._call_provider(provider, model, messages, max_tokens)

            duration_ms = int((time.time() - start_time) * 1000)
            tokens_input = result.get("tokens_input", 0)
            tokens_output = result.get("tokens_output", 0)
            total_tokens = tokens_input + tokens_output
            cost = self._calculate_cost(model, tokens_input, tokens_output)

            self._record_usage(
                agent_id=agent_config.get("agent_id"),
                user_id=user_id,
                provider=provider,
                model=model,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost=cost,
                latency_ms=duration_ms,
                status="completed",
                db=db,
            )

            return ExecutionResult(
                execution_id=execution_id,
                status="completed",
                output={
                    "result": result["content"],
                    "model": model,
                    "provider": provider,
                },
                tokens_used=total_tokens,
                cost=cost,
                duration_ms=duration_ms,
            )

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.error("Execution failed: %s", e)

            self._record_usage(
                agent_id=agent_config.get("agent_id"),
                user_id=user_id,
                provider=agent_config.get("model_provider", "unknown"),
                model=agent_config.get("model_name", "unknown"),
                tokens_input=0,
                tokens_output=0,
                cost=0.0,
                latency_ms=duration_ms,
                status="error",
                db=db,
            )

            return ExecutionResult(
                execution_id=execution_id,
                status="error",
                error=str(e),
                duration_ms=duration_ms,
            )


# Singleton instance
execution_service = AgentExecutionService()
