import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewListResponse
from app.models.review import Review
from app.models.agent import Agent

router = APIRouter(prefix="/agents/{agent_id}/reviews", tags=["reviews"])


@router.get("", response_model=ReviewListResponse)
def list_reviews(
    agent_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    query = db.query(Review).filter(Review.agent_id == agent_id)
    total = query.count()
    reviews = (
        query.order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.agent_id == agent_id
    ).scalar() or 0.0

    return ReviewListResponse(
        reviews=[ReviewResponse.model_validate(r) for r in reviews],
        total=total,
        average_rating=round(float(avg_rating), 2),
    )


@router.post("", response_model=ReviewResponse, status_code=201)
def create_review(
    agent_id: uuid.UUID,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # TODO: Replace with actual authenticated user ID from request token
    # when authentication middleware is fully integrated
    user_id = uuid.uuid4()  # Placeholder

    review = Review(
        agent_id=agent_id,
        user_id=user_id,
        rating=review_data.rating,
        title=review_data.title,
        content=review_data.content,
    )
    db.add(review)

    # Update agent average rating
    db.flush()
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.agent_id == agent_id
    ).scalar() or 0.0
    review_count = db.query(Review).filter(Review.agent_id == agent_id).count()
    agent.average_rating = round(float(avg_rating), 2)
    agent.total_reviews = review_count

    db.commit()
    db.refresh(review)
    return ReviewResponse.model_validate(review)
