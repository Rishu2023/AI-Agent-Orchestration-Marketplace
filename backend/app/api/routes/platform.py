from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.platform_stats import (
    PlatformStatsResponse,
    PlatformSnapshotResponse,
    SnapshotHistoryResponse,
)
from app.services import platform_service

router = APIRouter(prefix="/platform", tags=["platform"])


@router.get("/stats", response_model=PlatformStatsResponse)
def get_platform_stats(db: Session = Depends(get_db)):
    stats = platform_service.get_platform_stats(db)
    return PlatformStatsResponse(**stats)


@router.get("/stats/history", response_model=SnapshotHistoryResponse)
def get_snapshot_history(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    snapshots, total = platform_service.get_snapshot_history(db, days)
    return SnapshotHistoryResponse(
        snapshots=[PlatformSnapshotResponse.model_validate(s) for s in snapshots],
        total=total,
    )
