from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    nodes: Mapped[str] = mapped_column(Text, default="[]")  # JSON array of nodes
    edges: Mapped[str] = mapped_column(Text, default="[]")  # JSON array of edges
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    creator: Mapped["User"] = relationship("User", back_populates="workflows")  # noqa: F821
    executions: Mapped[list["Execution"]] = relationship("Execution", back_populates="workflow")  # noqa: F821
