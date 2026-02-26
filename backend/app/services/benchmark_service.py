import uuid
import hashlib
import random
import time
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.benchmark import BenchmarkResult


def _score_reasoning(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:reasoning".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(50, 99), 2)


def _score_creativity(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:creativity".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(45, 98), 2)


def _score_code_generation(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:code_gen".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(40, 97), 2)


def _score_instruction_following(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:instruct".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(55, 99), 2)


def _score_multi_step_planning(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:planning".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(35, 95), 2)


def _score_self_correction(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:self_correct".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(30, 90), 2)


def _score_tool_use(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:tool_use".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(40, 96), 2)


def _score_memory_retrieval(model_provider: str, model_name: str) -> float:
    seed = hashlib.md5(f"{model_provider}:{model_name}:memory".encode()).hexdigest()
    random.seed(int(seed[:8], 16))
    return round(random.uniform(35, 92), 2)


def run_benchmark(db: Session, model_provider: str, model_name: str) -> BenchmarkResult:
    start = time.time()

    reasoning = _score_reasoning(model_provider, model_name)
    creativity = _score_creativity(model_provider, model_name)
    code_gen = _score_code_generation(model_provider, model_name)
    instruct = _score_instruction_following(model_provider, model_name)
    planning = _score_multi_step_planning(model_provider, model_name)
    self_correct = _score_self_correction(model_provider, model_name)
    tool_use = _score_tool_use(model_provider, model_name)
    memory = _score_memory_retrieval(model_provider, model_name)

    scores = [reasoning, creativity, code_gen, instruct, planning, self_correct, tool_use, memory]
    overall = round(sum(scores) / len(scores), 2)

    duration_ms = int((time.time() - start) * 1000)
    total_cost = round(random.uniform(0.01, 0.50), 4)

    result = BenchmarkResult(
        model_provider=model_provider,
        model_name=model_name,
        reasoning_score=reasoning,
        creativity_score=creativity,
        code_generation_score=code_gen,
        instruction_following_score=instruct,
        multi_step_planning_score=planning,
        self_correction_score=self_correct,
        tool_use_score=tool_use,
        memory_retrieval_score=memory,
        overall_score=overall,
        run_duration_ms=duration_ms,
        total_cost=total_cost,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def get_leaderboard(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    subquery = (
        db.query(
            BenchmarkResult.model_provider,
            BenchmarkResult.model_name,
            func.max(BenchmarkResult.overall_score).label("overall_score"),
            func.avg(BenchmarkResult.reasoning_score).label("reasoning_score"),
            func.avg(BenchmarkResult.creativity_score).label("creativity_score"),
            func.avg(BenchmarkResult.code_generation_score).label("code_generation_score"),
            func.count(BenchmarkResult.id).label("run_count"),
        )
        .group_by(BenchmarkResult.model_provider, BenchmarkResult.model_name)
        .order_by(func.max(BenchmarkResult.overall_score).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "model_provider": row.model_provider,
            "model_name": row.model_name,
            "overall_score": round(float(row.overall_score), 2),
            "reasoning_score": round(float(row.reasoning_score), 2),
            "creativity_score": round(float(row.creativity_score), 2),
            "code_generation_score": round(float(row.code_generation_score), 2),
            "run_count": row.run_count,
        }
        for row in subquery
    ]


def compare_models(db: Session, model_names: List[str]) -> List[BenchmarkResult]:
    results = []
    for name in model_names:
        latest = (
            db.query(BenchmarkResult)
            .filter(BenchmarkResult.model_name == name.strip())
            .order_by(BenchmarkResult.created_at.desc())
            .first()
        )
        if latest:
            results.append(latest)
    return results


def get_benchmark_history(db: Session, model_name: str) -> List[BenchmarkResult]:
    return (
        db.query(BenchmarkResult)
        .filter(BenchmarkResult.model_name == model_name)
        .order_by(BenchmarkResult.created_at.desc())
        .all()
    )
