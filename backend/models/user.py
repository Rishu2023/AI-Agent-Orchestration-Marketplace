from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    api_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    agents: Mapped[list["Agent"]] = relationship("Agent", back_populates="creator")  # noqa: F821
    workflows: Mapped[list["Workflow"]] = relationship("Workflow", back_populates="creator")  # noqa: F821
    executions: Mapped[list["Execution"]] = relationship("Execution", back_populates="user")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")  # noqa: F821
