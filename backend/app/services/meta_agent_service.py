"""
Meta-agent service - evaluates agent performance and generates improved versions.
"""
import uuid
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.execution_service import execution_service

logger = logging.getLogger(__name__)

# Standard test cases keyed by agent category
DEFAULT_TEST_CASES: Dict[str, List[Dict[str, Any]]] = {
    "research": [
        {"input": {"query": "Summarize the key findings of transformer architectures."}, "expected_keywords": ["attention", "transformer"]},
        {"input": {"query": "What are the benefits of retrieval-augmented generation?"}, "expected_keywords": ["retrieval", "generation"]},
    ],
    "coding": [
        {"input": {"query": "Write a Python function to reverse a linked list."}, "expected_keywords": ["def", "node", "next"]},
        {"input": {"query": "Explain the difference between a stack and a queue."}, "expected_keywords": ["stack", "queue", "FIFO"]},
    ],
    "writing": [
        {"input": {"query": "Write a professional email requesting a meeting."}, "expected_keywords": ["meeting", "schedule"]},
    ],
    "analysis": [
        {"input": {"query": "Analyze the pros and cons of microservices architecture."}, "expected_keywords": ["microservice", "scalab"]},
    ],
    "default": [
        {"input": {"query": "Hello, how can you help me?"}, "expected_keywords": ["help"]},
    ],
}


class EvaluationResult:
    def __init__(
        self,
        agent_id: str,
        accuracy_score: float,
        speed_score: float,
        cost_score: float,
        overall_score: float,
        details: Dict[str, Any],
    ):
        self.agent_id = agent_id
        self.accuracy_score = accuracy_score
        self.speed_score = speed_score
        self.cost_score = cost_score
        self.overall_score = overall_score
        self.details = details
        self.evaluated_at = datetime.utcnow()


class MetaAgentService:
    """Evaluates and improves agents automatically."""

    def __init__(self):
        self.evaluation_results: Dict[str, EvaluationResult] = {}
        self._evaluation_task: Optional[asyncio.Task] = None
        self._running = False

    def _get_test_cases(self, category: str) -> List[Dict[str, Any]]:
        return DEFAULT_TEST_CASES.get(category, DEFAULT_TEST_CASES["default"])

    def _score_accuracy(self, output: str, expected_keywords: List[str]) -> float:
        if not expected_keywords:
            return 1.0 if output else 0.0
        output_lower = output.lower()
        matches = sum(1 for kw in expected_keywords if kw.lower() in output_lower)
        return matches / len(expected_keywords)

    def _score_speed(self, latency_ms: int) -> float:
        if latency_ms <= 500:
            return 1.0
        if latency_ms >= 10000:
            return 0.0
        return max(0.0, 1.0 - (latency_ms - 500) / 9500.0)

    def _score_cost(self, cost: float) -> float:
        if cost <= 0.0:
            return 1.0
        if cost >= 0.10:
            return 0.0
        return max(0.0, 1.0 - cost / 0.10)

    async def evaluate_agent(
        self,
        agent_id: str,
        agent_config: Dict[str, Any],
        test_cases: Optional[List[Dict[str, Any]]] = None,
    ) -> EvaluationResult:
        category = agent_config.get("category", "default")
        cases = test_cases or self._get_test_cases(category)

        accuracy_scores: List[float] = []
        speed_scores: List[float] = []
        cost_scores: List[float] = []
        case_details: List[Dict[str, Any]] = []

        for case in cases:
            result = await execution_service.execute_agent(
                agent_config=agent_config,
                input_data=case["input"],
                user_id="meta-agent-evaluator",
            )

            output_text = ""
            if result.output and "result" in result.output:
                output_text = str(result.output["result"])

            acc = self._score_accuracy(output_text, case.get("expected_keywords", []))
            spd = self._score_speed(result.duration_ms)
            cst = self._score_cost(result.cost)

            accuracy_scores.append(acc)
            speed_scores.append(spd)
            cost_scores.append(cst)
            case_details.append({
                "input": case["input"],
                "status": result.status,
                "accuracy": acc,
                "speed": spd,
                "cost": cst,
                "latency_ms": result.duration_ms,
                "cost_usd": result.cost,
            })

        avg_accuracy = sum(accuracy_scores) / len(accuracy_scores) if accuracy_scores else 0.0
        avg_speed = sum(speed_scores) / len(speed_scores) if speed_scores else 0.0
        avg_cost = sum(cost_scores) / len(cost_scores) if cost_scores else 0.0
        overall = avg_accuracy * 0.5 + avg_speed * 0.3 + avg_cost * 0.2

        eval_result = EvaluationResult(
            agent_id=agent_id,
            accuracy_score=round(avg_accuracy, 4),
            speed_score=round(avg_speed, 4),
            cost_score=round(avg_cost, 4),
            overall_score=round(overall, 4),
            details={"cases": case_details, "category": category},
        )
        self.evaluation_results[agent_id] = eval_result
        return eval_result

    async def evaluate_all_agents(self, agents: List[Dict[str, Any]]) -> List[EvaluationResult]:
        results: List[EvaluationResult] = []
        for agent in agents:
            agent_id = str(agent.get("id", uuid.uuid4()))
            agent_config = {
                "model_provider": agent.get("model_provider", "openai"),
                "model_name": agent.get("model_name", "gpt-4"),
                "system_prompt": agent.get("system_prompt", "You are a helpful assistant."),
                "category": agent.get("category", "default"),
            }
            try:
                result = await self.evaluate_agent(agent_id, agent_config)
                results.append(result)
            except Exception as exc:
                logger.error("Failed to evaluate agent %s: %s", agent_id, exc)
        return results

    async def generate_improved_agent(
        self, agent_id: str, agent_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate an improved version of an underperforming agent."""
        eval_result = self.evaluation_results.get(agent_id)

        improvements: Dict[str, Any] = dict(agent_config)
        improvements["parent_agent_id"] = agent_id
        improvements["is_improved_version"] = True

        if eval_result is None:
            eval_result = await self.evaluate_agent(agent_id, agent_config)

        if eval_result.speed_score < 0.5:
            current_provider = agent_config.get("model_provider", "openai")
            current_model = agent_config.get("model_name", "gpt-4")
            faster_alternatives = {
                ("openai", "gpt-4"): ("openai", "gpt-3.5-turbo"),
                ("anthropic", "claude-3-opus-20240229"): ("anthropic", "claude-3-sonnet-20240229"),
                ("anthropic", "claude-3-sonnet-20240229"): ("anthropic", "claude-3-haiku-20240307"),
                ("mistral", "mistral-large-latest"): ("mistral", "mistral-small-latest"),
            }
            alt = faster_alternatives.get((current_provider, current_model))
            if alt:
                improvements["model_provider"] = alt[0]
                improvements["model_name"] = alt[1]

        if eval_result.accuracy_score < 0.5:
            original_prompt = agent_config.get("system_prompt", "")
            improvements["system_prompt"] = (
                f"{original_prompt}\n\n"
                "IMPORTANT: Be thorough and precise in your responses. "
                "Include specific details, examples, and relevant technical terms. "
                "Structure your response clearly with key points highlighted."
            )

        if eval_result.cost_score < 0.5:
            improvements["max_tokens"] = min(
                agent_config.get("max_tokens", 4096), 2048
            )

        improvements["improvement_reason"] = {
            "parent_scores": {
                "accuracy": eval_result.accuracy_score,
                "speed": eval_result.speed_score,
                "cost": eval_result.cost_score,
                "overall": eval_result.overall_score,
            },
            "changes_applied": [],
        }

        if improvements.get("model_name") != agent_config.get("model_name"):
            improvements["improvement_reason"]["changes_applied"].append("model_change")
        if improvements.get("system_prompt") != agent_config.get("system_prompt"):
            improvements["improvement_reason"]["changes_applied"].append("prompt_enhancement")
        if improvements.get("max_tokens") != agent_config.get("max_tokens"):
            improvements["improvement_reason"]["changes_applied"].append("token_limit_reduction")

        return improvements

    async def schedule_evaluation(self, agents: List[Dict[str, Any]]) -> None:
        """Background task that evaluates all agents every 24 hours."""
        self._running = True
        while self._running:
            try:
                logger.info("Starting scheduled agent evaluation cycle")
                await self.evaluate_all_agents(agents)
                logger.info("Completed scheduled agent evaluation cycle")
            except Exception as exc:
                logger.error("Scheduled evaluation failed: %s", exc)
            await asyncio.sleep(86400)  # 24 hours

    def stop_scheduled_evaluation(self) -> None:
        self._running = False
        if self._evaluation_task and not self._evaluation_task.done():
            self._evaluation_task.cancel()

    def start_background_evaluation(self, agents: List[Dict[str, Any]]) -> None:
        loop = asyncio.get_event_loop()
        self._evaluation_task = loop.create_task(self.schedule_evaluation(agents))


# Singleton instance
meta_agent_service = MetaAgentService()
