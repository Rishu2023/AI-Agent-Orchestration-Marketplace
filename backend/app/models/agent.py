import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum


class AgentCategory(str, enum.Enum):
    RESEARCH = "research"
    WRITING = "writing"
    CODING = "coding"
    ANALYSIS = "analysis"
    MARKETING = "marketing"
    SALES = "sales"
    CUSTOMER_SUPPORT = "customer_support"
    DATA_PROCESSING = "data_processing"
    CREATIVE = "creative"
    PRODUCTIVITY = "productivity"
    OTHER = "other"


class PricingModel(str, enum.Enum):
    FREE = "free"
    ONE_TIME = "one_time"
    SUBSCRIPTION = "subscription"
    PER_USE = "per_use"


class AgentStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    long_description = Column(Text)
    category = Column(String(50), nullable=False, default=AgentCategory.OTHER.value)
    tags = Column(JSON, default=list)
    icon_url = Column(String(500))
    banner_url = Column(String(500))

    # Publisher
    publisher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Configuration
    system_prompt = Column(Text)
    model_provider = Column(String(50), default="openai")
    model_name = Column(String(100), default="gpt-4")
    tools = Column(JSON, default=list)
    parameters = Column(JSON, default=dict)
    input_schema = Column(JSON)
    output_schema = Column(JSON)

    # Pricing
    pricing_model = Column(String(20), default=PricingModel.FREE.value)
    price = Column(Float, default=0.0)
    currency = Column(String(3), default="USD")

    # Status
    status = Column(String(20), default=AgentStatus.DRAFT.value)
    is_featured = Column(Boolean, default=False)

    # Metrics
    total_runs = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

    # Relationships
    publisher = relationship("User", back_populates="agents")
    versions = relationship("AgentVersion", back_populates="agent", order_by="AgentVersion.version_number.desc()")
    reviews = relationship("Review", back_populates="agent")


class AgentVersion(Base):
    __tablename__ = "agent_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=False)
    version_number = Column(String(20), nullable=False)
    changelog = Column(Text)
    system_prompt = Column(Text)
    model_provider = Column(String(50))
    model_name = Column(String(100))
    tools = Column(JSON, default=list)
    parameters = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent = relationship("Agent", back_populates="versions")
