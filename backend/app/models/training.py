import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, Uuid, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    base_model = Column(String(100), nullable=False)
    dataset_name = Column(String(200), nullable=False)
    dataset_path = Column(String(500))
    dataset_size = Column(Integer, default=0)
    status = Column(String(20), default="queued")
    progress = Column(Float, default=0.0)
    config = Column(JSON, default=dict)
    metrics = Column(JSON, default=dict)
    result_model_path = Column(String(500))
    error_message = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    fine_tuned_model = relationship("FineTunedModel", back_populates="training_job", uselist=False)


class FineTunedModel(Base):
    __tablename__ = "fine_tuned_models"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    training_job_id = Column(Uuid, ForeignKey("training_jobs.id"), nullable=False)
    user_id = Column(Uuid, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    base_model = Column(String(100), nullable=False)
    model_path = Column(String(500))
    description = Column(Text)
    performance_metrics = Column(JSON, default=dict)
    is_published = Column(Boolean, default=False)
    downloads = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    training_job = relationship("TrainingJob", back_populates="fine_tuned_model")
