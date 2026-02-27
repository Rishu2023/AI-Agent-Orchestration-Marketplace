import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Uuid
from app.database.session import Base


class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    model_provider = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False, index=True)
    reasoning_score = Column(Float, default=0.0)
    creativity_score = Column(Float, default=0.0)
    code_generation_score = Column(Float, default=0.0)
    instruction_following_score = Column(Float, default=0.0)
    multi_step_planning_score = Column(Float, default=0.0)
    self_correction_score = Column(Float, default=0.0)
    tool_use_score = Column(Float, default=0.0)
    memory_retrieval_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    run_duration_ms = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    benchmark_version = Column(String(20), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
