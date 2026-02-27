from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.benchmark import (
    BenchmarkRunRequest, BenchmarkResultResponse,
    LeaderboardEntry, LeaderboardResponse,
    ModelComparisonResponse, BenchmarkHistoryResponse,
)
from app.services import benchmark_service

router = APIRouter(prefix="/benchmarks", tags=["benchmarks"])


@router.post("/run", response_model=BenchmarkResultResponse, status_code=201)
def run_benchmark(request: BenchmarkRunRequest, db: Session = Depends(get_db)):
    result = benchmark_service.run_benchmark(
        db, model_provider=request.model_provider, model_name=request.model_name,
    )
    return BenchmarkResultResponse.model_validate(result)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    entries = benchmark_service.get_leaderboard(db, limit=limit)
    return LeaderboardResponse(
        entries=[LeaderboardEntry(**e) for e in entries],
    )


@router.get("/compare", response_model=ModelComparisonResponse)
def compare_models(
    models: str = Query(..., description="Comma-separated model names"),
    db: Session = Depends(get_db),
):
    model_names = [m.strip() for m in models.split(",")]
    results = benchmark_service.compare_models(db, model_names=model_names)
    return ModelComparisonResponse(
        models=[BenchmarkResultResponse.model_validate(r) for r in results],
    )


@router.get("/history/{model_name}", response_model=BenchmarkHistoryResponse)
def get_benchmark_history(model_name: str, db: Session = Depends(get_db)):
    history = benchmark_service.get_benchmark_history(db, model_name=model_name)
    return BenchmarkHistoryResponse(
        model_name=model_name,
        history=[BenchmarkResultResponse.model_validate(r) for r in history],
    )
