from datetime import datetime
from sqlalchemy import String, Text, Float, Integer, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    pricing_type: Mapped[str] = mapped_column(String(50), default="free")  # free, per_use, subscription
    price: Mapped[float] = mapped_column(Float, default=0.0)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    tools_config: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    execution_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    creator: Mapped["User"] = relationship("User", back_populates="agents")  # noqa: F821
    executions: Mapped[list["Execution"]] = relationship("Execution", back_populates="agent")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="agent")  # noqa: F821
