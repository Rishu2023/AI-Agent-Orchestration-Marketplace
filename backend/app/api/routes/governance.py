import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.governance import (
    ProposalCreate,
    ProposalResponse,
    ProposalListResponse,
    VoteCreate,
    VoteResponse,
    VotingResultsResponse,
)
from app.services import governance_service

router = APIRouter(prefix="/governance", tags=["governance"])


@router.post("/proposals", response_model=ProposalResponse, status_code=201)
def create_proposal(request: ProposalCreate, db: Session = Depends(get_db)):
    proposal = governance_service.create_proposal(
        db=db,
        title=request.title,
        description=request.description,
        proposal_type=request.proposal_type,
        proposed_by=request.proposed_by,
    )
    return ProposalResponse.model_validate(proposal)


@router.get("/proposals", response_model=ProposalListResponse)
def list_proposals(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    proposals, total = governance_service.list_proposals(db, status, page, page_size)
    return ProposalListResponse(
        proposals=[ProposalResponse.model_validate(p) for p in proposals],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/proposals/{proposal_id}", response_model=ProposalResponse)
def get_proposal(proposal_id: uuid.UUID, db: Session = Depends(get_db)):
    proposal = governance_service.get_proposal(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    governance_service.check_and_finalize(db, proposal_id)
    return ProposalResponse.model_validate(proposal)


@router.post("/proposals/{proposal_id}/vote", response_model=VoteResponse, status_code=201)
def cast_vote(
    proposal_id: uuid.UUID,
    request: VoteCreate,
    db: Session = Depends(get_db),
):
    vote = governance_service.cast_vote(
        db=db,
        proposal_id=proposal_id,
        user_id=request.user_id,
        vote_type=request.vote_type,
        weight=request.weight,
    )
    if not vote:
        raise HTTPException(
            status_code=400,
            detail="Cannot vote: proposal not active or already voted",
        )
    return VoteResponse.model_validate(vote)


@router.post("/proposals/{proposal_id}/veto", response_model=ProposalResponse)
def veto_proposal(proposal_id: uuid.UUID, db: Session = Depends(get_db)):
    proposal = governance_service.veto_proposal(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return ProposalResponse.model_validate(proposal)


@router.get("/proposals/{proposal_id}/results", response_model=VotingResultsResponse)
def get_results(proposal_id: uuid.UUID, db: Session = Depends(get_db)):
    results = governance_service.get_results(db, proposal_id)
    if not results:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return VotingResultsResponse(**results)
