"""
Recursive agent service - enables agents to spawn sub-agents, feed back results,
and self-modify workflows with depth and circuit-breaker safety controls.
"""
import uuid
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.execution_service import execution_service, ExecutionResult

logger = logging.getLogger(__name__)

MAX_RECURSION_DEPTH = 5


class CircuitBreaker:
    """Prevents infinite loops by tracking failure rates and tripping open."""

    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = self.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.success_count = 0

    def record_success(self) -> None:
        self.failure_count = 0
        self.success_count += 1
        if self.state == self.HALF_OPEN:
            self.state = self.CLOSED

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = self.OPEN

    def can_execute(self) -> bool:
        if self.state == self.CLOSED:
            return True
        if self.state == self.OPEN:
            if (
                self.last_failure_time
                and (time.time() - self.last_failure_time) >= self.recovery_timeout
            ):
                self.state = self.HALF_OPEN
                return True
            return False
        # HALF_OPEN: allow one request to test recovery
        return True

    def reset(self) -> None:
        self.state = self.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None


class RecursiveAgentService:
    """Handles recursive agent patterns: sub-agent spawning, feedback loops, and
    self-modifying workflows with safety limits."""

    def __init__(self):
        self.execution_tree: Dict[str, Dict[str, Any]] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}

    def _get_circuit_breaker(self, key: str) -> CircuitBreaker:
        if key not in self.circuit_breakers:
            self.circuit_breakers[key] = CircuitBreaker()
        return self.circuit_breakers[key]

    def _get_depth(self, agent_id: str) -> int:
        depth = 0
        current = agent_id
        while current in self.execution_tree:
            parent = self.execution_tree[current].get("parent_agent_id")
            if parent is None:
                break
            depth += 1
            current = parent
            if depth > MAX_RECURSION_DEPTH:
                break
        return depth

    async def spawn_sub_agent(
        self,
        parent_agent_id: str,
        subtask: Dict[str, Any],
        parent_config: Dict[str, Any],
        user_id: str,
    ) -> ExecutionResult:
        """Spawn a sub-agent from a parent agent to handle a subtask."""
        cb = self._get_circuit_breaker(parent_agent_id)
        if not cb.can_execute():
            return ExecutionResult(
                execution_id=str(uuid.uuid4()),
                status="error",
                error="Circuit breaker is open. Too many failures detected.",
            )

        depth = self._get_depth(parent_agent_id)
        if depth >= MAX_RECURSION_DEPTH:
            return ExecutionResult(
                execution_id=str(uuid.uuid4()),
                status="error",
                error=f"Maximum recursion depth ({MAX_RECURSION_DEPTH}) exceeded.",
            )

        sub_agent_id = str(uuid.uuid4())
        self.execution_tree[sub_agent_id] = {
            "parent_agent_id": parent_agent_id,
            "subtask": subtask,
            "depth": depth + 1,
            "created_at": datetime.utcnow().isoformat(),
        }

        sub_config = dict(parent_config)
        sub_config["agent_id"] = sub_agent_id
        if "system_prompt" in subtask:
            sub_config["system_prompt"] = subtask["system_prompt"]

        input_data = subtask.get("input", {"query": subtask.get("description", "")})

        try:
            result = await execution_service.execute_agent(
                agent_config=sub_config,
                input_data=input_data,
                user_id=user_id,
            )

            self.execution_tree[sub_agent_id]["result"] = {
                "execution_id": result.execution_id,
                "status": result.status,
                "tokens_used": result.tokens_used,
                "cost": result.cost,
            }

            if result.status == "completed":
                cb.record_success()
            else:
                cb.record_failure()

            return result

        except Exception as exc:
            cb.record_failure()
            logger.error("Sub-agent %s failed: %s", sub_agent_id, exc)
            return ExecutionResult(
                execution_id=str(uuid.uuid4()),
                status="error",
                error=str(exc),
            )

    async def feedback_loop(
        self,
        execution_id: str,
        agent_config: Dict[str, Any],
        previous_result: ExecutionResult,
        user_id: str,
        iteration: int = 0,
        max_iterations: int = 3,
    ) -> ExecutionResult:
        """Feed execution results back as context for the next run."""
        if iteration >= max_iterations:
            return previous_result

        cb = self._get_circuit_breaker(f"feedback-{execution_id}")
        if not cb.can_execute():
            return ExecutionResult(
                execution_id=execution_id,
                status="error",
                error="Feedback loop circuit breaker is open.",
            )

        if previous_result.status != "completed" or not previous_result.output:
            cb.record_failure()
            return previous_result

        previous_output = previous_result.output.get("result", "")
        enriched_input = {
            "query": (
                f"Previous result (iteration {iteration}): {previous_output}\n\n"
                "Please review and improve upon this result. "
                "Fix any errors, add missing details, and enhance the quality."
            ),
        }

        result = await execution_service.execute_agent(
            agent_config=agent_config,
            input_data=enriched_input,
            user_id=user_id,
        )

        if result.status == "completed":
            cb.record_success()
            result.tokens_used += previous_result.tokens_used
            result.cost += previous_result.cost
        else:
            cb.record_failure()
            return previous_result

        return result

    async def self_modify_workflow(
        self,
        workflow_id: str,
        steps: List[Dict[str, Any]],
        intermediate_results: List[Dict[str, Any]],
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """Allow a workflow to modify its remaining steps based on intermediate results."""
        if not intermediate_results:
            return steps

        cb = self._get_circuit_breaker(f"workflow-{workflow_id}")
        if not cb.can_execute():
            logger.warning("Workflow %s circuit breaker is open, returning original steps", workflow_id)
            return steps

        completed_count = len(intermediate_results)
        remaining_steps = steps[completed_count:]

        if not remaining_steps:
            return steps

        last_result = intermediate_results[-1]
        last_status = last_result.get("status", "completed")

        modified_steps = list(steps[:completed_count])

        if last_status == "error":
            cb.record_failure()
            error_msg = last_result.get("error", "Unknown error")
            retry_step = dict(remaining_steps[0])
            retry_step["name"] = f"{retry_step.get('name', 'Step')} (retry)"
            retry_step["config"] = dict(retry_step.get("config", {}))
            retry_step["config"]["retry_context"] = error_msg
            retry_step["config"]["is_retry"] = True
            modified_steps.append(retry_step)
            modified_steps.extend(remaining_steps[1:])
        else:
            cb.record_success()
            last_output = last_result.get("output", {})

            for step in remaining_steps:
                modified_step = dict(step)
                input_mapping = dict(modified_step.get("input_mapping", {}))
                input_mapping["previous_output"] = last_output
                modified_step["input_mapping"] = input_mapping
                modified_steps.append(modified_step)

        if len(modified_steps) > len(steps) + MAX_RECURSION_DEPTH:
            logger.warning("Workflow %s step count exceeded safety limit", workflow_id)
            return steps

        return modified_steps

    def get_execution_tree(self, agent_id: str) -> Dict[str, Any]:
        """Return the full execution tree for an agent and its sub-agents."""
        tree: Dict[str, Any] = {"agent_id": agent_id, "children": []}
        for sub_id, info in self.execution_tree.items():
            if info.get("parent_agent_id") == agent_id:
                child_tree = self.get_execution_tree(sub_id)
                child_tree["subtask"] = info.get("subtask")
                child_tree["depth"] = info.get("depth")
                child_tree["result"] = info.get("result")
                tree["children"].append(child_tree)
        return tree

    def reset(self) -> None:
        self.execution_tree.clear()
        self.circuit_breakers.clear()


# Singleton instance
recursive_agent_service = RecursiveAgentService()
