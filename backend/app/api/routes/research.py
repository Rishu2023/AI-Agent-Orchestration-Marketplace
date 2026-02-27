import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.research import (
    ResearchPaperResponse, ResearchPaperListResponse,
    TrendingModelResponse, TrendingModelListResponse,
    ResearchScanResponse,
)
from app.services import research_agent_service

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/papers", response_model=ResearchPaperListResponse)
def get_latest_papers(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    papers = research_agent_service.get_latest_papers(db, limit=limit)
    return ResearchPaperListResponse(
        papers=[ResearchPaperResponse.model_validate(p) for p in papers],
        total=len(papers),
    )


@router.get("/papers/{paper_id}", response_model=ResearchPaperResponse)
def get_paper(paper_id: uuid.UUID, db: Session = Depends(get_db)):
    paper = research_agent_service.get_paper_by_id(db, paper_id=paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return ResearchPaperResponse.model_validate(paper)


@router.post("/scan", response_model=ResearchScanResponse)
def trigger_research_scan(db: Session = Depends(get_db)):
    result = research_agent_service.run_research_cycle(db)
    return ResearchScanResponse(
        papers_found=result["papers_found"],
        models_found=result["models_found"],
        agents_created=result["agents_created"],
        message="Research scan completed successfully",
    )


@router.get("/trending", response_model=TrendingModelListResponse)
def get_trending_models(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    models = research_agent_service.get_trending_models(db, limit=limit)
    return TrendingModelListResponse(
        models=[TrendingModelResponse.model_validate(m) for m in models],
        total=len(models),
    )


@router.get("/auto-agents", response_model=ResearchPaperListResponse)
def get_auto_agents(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    papers = research_agent_service.get_auto_created_agents(db, limit=limit)
    return ResearchPaperListResponse(
        papers=[ResearchPaperResponse.model_validate(p) for p in papers],
        total=len(papers),
    )
