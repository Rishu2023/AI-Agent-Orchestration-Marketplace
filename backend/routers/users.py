from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.review import Review
from models.agent import Agent
from schemas.user import UserCreate, UserLogin, UserResponse, Token, ApiKeyResponse
from schemas.review import ReviewCreate, ReviewResponse
from auth import hash_password, verify_password, create_access_token, get_current_user, generate_api_key

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/me/api-key", response_model=ApiKeyResponse)
async def generate_user_api_key(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_key = generate_api_key()
    current_user.api_key = api_key
    await db.commit()
    return ApiKeyResponse(api_key=api_key)


@router.post("/reviews", response_model=ReviewResponse, status_code=201)
async def add_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_result = await db.execute(select(Agent).where(Agent.id == data.agent_id))
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    review = Review(
        agent_id=data.agent_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)

    # Update agent rating
    from sqlalchemy import func
    rating_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.agent_id == data.agent_id)
    )
    avg_rating, count = rating_result.one()
    new_count = (count or 0) + 1
    new_avg = ((avg_rating or 0) * (count or 0) + data.rating) / new_count
    agent.rating = round(new_avg, 2)
    agent.review_count = new_count

    await db.commit()
    await db.refresh(review)
    return review


@router.get("/reviews/{agent_id}", response_model=list[ReviewResponse])
async def get_agent_reviews(agent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.agent_id == agent_id).order_by(Review.created_at.desc()))
    return result.scalars().all()
