import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.governance import Proposal, Vote


def create_proposal(
    db: Session,
    title: str,
    description: str,
    proposal_type: str,
    proposed_by: uuid.UUID,
) -> Proposal:
    proposal = Proposal(
        title=title,
        description=description,
        proposal_type=proposal_type,
        proposed_by=proposed_by,
        voting_deadline=datetime.utcnow() + timedelta(days=7),
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


def list_proposals(
    db: Session,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Proposal], int]:
    query = db.query(Proposal)
    if status:
        query = query.filter(Proposal.status == status)
    total = query.count()
    proposals = (
        query.order_by(desc(Proposal.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return proposals, total


def get_proposal(db: Session, proposal_id: uuid.UUID) -> Optional[Proposal]:
    return db.query(Proposal).filter(Proposal.id == proposal_id).first()


def cast_vote(
    db: Session,
    proposal_id: uuid.UUID,
    user_id: uuid.UUID,
    vote_type: str,
    weight: float = 1.0,
) -> Optional[Vote]:
    proposal = get_proposal(db, proposal_id)
    if not proposal or proposal.status != "active":
        return None

    existing = (
        db.query(Vote)
        .filter(Vote.proposal_id == proposal_id, Vote.user_id == user_id)
        .first()
    )
    if existing:
        return None

    vote = Vote(
        proposal_id=proposal_id,
        user_id=user_id,
        vote_type=vote_type,
        weight=weight,
    )
    db.add(vote)

    if vote_type == "for":
        proposal.votes_for += 1
    else:
        proposal.votes_against += 1

    db.commit()
    db.refresh(vote)
    return vote


def check_and_finalize(db: Session, proposal_id: uuid.UUID) -> Optional[Proposal]:
    proposal = get_proposal(db, proposal_id)
    if not proposal or proposal.status != "active":
        return proposal

    if datetime.utcnow() >= proposal.voting_deadline:
        if proposal.votes_for > proposal.votes_against:
            proposal.status = "passed"
        else:
            proposal.status = "rejected"
        db.commit()
        db.refresh(proposal)

    return proposal


def veto_proposal(db: Session, proposal_id: uuid.UUID) -> Optional[Proposal]:
    proposal = get_proposal(db, proposal_id)
    if not proposal:
        return None
    proposal.status = "vetoed"
    db.commit()
    db.refresh(proposal)
    return proposal


def get_results(db: Session, proposal_id: uuid.UUID) -> Optional[dict]:
    proposal = get_proposal(db, proposal_id)
    if not proposal:
        return None
    return {
        "proposal_id": proposal.id,
        "title": proposal.title,
        "status": proposal.status,
        "votes_for": proposal.votes_for,
        "votes_against": proposal.votes_against,
        "total_votes": proposal.votes_for + proposal.votes_against,
        "voting_deadline": proposal.voting_deadline,
    }
