import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Float, ForeignKey, JSON, Uuid
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class WorkflowStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StepType(str, enum.Enum):
    AGENT = "agent"
    CONDITION = "condition"
    PARALLEL = "parallel"
    HUMAN_REVIEW = "human_review"
    DELAY = "delay"
    TRANSFORM = "transform"


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)

    # Configuration
    steps_config = Column(JSON, default=list)
    variables = Column(JSON, default=dict)
    is_template = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)

    # Status
    status = Column(String(20), default=WorkflowStatus.DRAFT.value)

    # Metrics
    total_runs = Column(Integer, default=0)
    average_duration = Column(Float, default=0.0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="workflows")
    steps = relationship("WorkflowStep", back_populates="workflow", order_by="WorkflowStep.position")
    executions = relationship("WorkflowExecution", back_populates="workflow")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    workflow_id = Column(Uuid, ForeignKey("workflows.id"), nullable=False)
    name = Column(String(200), nullable=False)
    step_type = Column(String(20), nullable=False)
    position = Column(Integer, nullable=False)

    # Agent reference (if step_type is 'agent')
    agent_id = Column(Uuid, ForeignKey("agents.id"), nullable=True)

    # Configuration
    config = Column(JSON, default=dict)
    input_mapping = Column(JSON, default=dict)
    output_mapping = Column(JSON, default=dict)
    condition = Column(JSON)

    # Visual position for workflow builder
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)

    # Connections
    next_step_id = Column(Uuid, ForeignKey("workflow_steps.id"), nullable=True)
    on_failure_step_id = Column(Uuid, ForeignKey("workflow_steps.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    workflow = relationship("Workflow", back_populates="steps")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    workflow_id = Column(Uuid, ForeignKey("workflows.id"), nullable=False)
    triggered_by = Column(Uuid, ForeignKey("users.id"), nullable=False)

    status = Column(String(20), default=ExecutionStatus.PENDING.value)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON)
    current_step = Column(Integer, default=0)
    step_results = Column(JSON, default=list)
    error_message = Column(Text)

    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Cost tracking
    total_cost = Column(Float, default=0.0)
    total_tokens = Column(Integer, default=0)

    workflow = relationship("Workflow", back_populates="executions")
