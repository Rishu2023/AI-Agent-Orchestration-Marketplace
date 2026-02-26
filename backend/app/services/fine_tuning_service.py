import uuid
import random
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.training import TrainingJob, FineTunedModel


def create_training_job(
    db: Session,
    user_id: uuid.UUID,
    model_name: str,
    base_model: str,
    dataset_name: str,
    config: Optional[Dict[str, Any]] = None,
    dataset_path: Optional[str] = None,
    dataset_size: int = 0,
) -> TrainingJob:
    default_config = {
        "learning_rate": 2e-5,
        "epochs": 3,
        "batch_size": 8,
        "lora_rank": 16,
    }
    if config:
        default_config.update(config)

    job = TrainingJob(
        user_id=user_id,
        model_name=model_name,
        base_model=base_model,
        dataset_name=dataset_name,
        dataset_path=dataset_path or f"/datasets/{dataset_name}",
        dataset_size=dataset_size,
        status="queued",
        config=default_config,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def start_training(db: Session, job_id: uuid.UUID) -> Optional[TrainingJob]:
    job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
    if not job:
        return None
    if job.status not in ("queued", "failed"):
        return job

    job.status = "preparing"
    job.started_at = datetime.utcnow()
    job.progress = 0.0
    db.commit()

    # Simulate training progress
    epochs = job.config.get("epochs", 3) if job.config else 3
    metrics = {"loss": [], "accuracy": []}

    for epoch in range(epochs):
        loss = round(random.uniform(0.1, 2.0) * (1 - epoch / epochs), 4)
        accuracy = round(min(0.5 + epoch * 0.15 + random.uniform(0, 0.1), 0.99), 4)
        metrics["loss"].append(loss)
        metrics["accuracy"].append(accuracy)

    job.status = "completed"
    job.progress = 100.0
    job.metrics = metrics
    job.completed_at = datetime.utcnow()
    job.result_model_path = f"/models/{job.model_name}_{job.id}"

    fine_tuned = FineTunedModel(
        training_job_id=job.id,
        user_id=job.user_id,
        name=job.model_name,
        base_model=job.base_model,
        model_path=job.result_model_path,
        description=f"Fine-tuned {job.base_model} on {job.dataset_name}",
        performance_metrics={
            "final_loss": metrics["loss"][-1] if metrics["loss"] else 0,
            "final_accuracy": metrics["accuracy"][-1] if metrics["accuracy"] else 0,
        },
    )
    db.add(fine_tuned)
    db.commit()
    db.refresh(job)
    return job


def get_job_status(db: Session, job_id: uuid.UUID) -> Optional[TrainingJob]:
    return db.query(TrainingJob).filter(TrainingJob.id == job_id).first()


def list_jobs(
    db: Session,
    user_id: Optional[uuid.UUID] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[TrainingJob], int]:
    q = db.query(TrainingJob)
    if user_id:
        q = q.filter(TrainingJob.user_id == user_id)
    total = q.count()
    jobs = (
        q.order_by(TrainingJob.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return jobs, total


def list_models(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    published_only: bool = False,
) -> Tuple[List[FineTunedModel], int]:
    q = db.query(FineTunedModel)
    if published_only:
        q = q.filter(FineTunedModel.is_published.is_(True))
    total = q.count()
    models = (
        q.order_by(FineTunedModel.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return models, total


def publish_model(db: Session, model_id: uuid.UUID) -> Optional[FineTunedModel]:
    model = db.query(FineTunedModel).filter(FineTunedModel.id == model_id).first()
    if not model:
        return None
    model.is_published = True
    db.commit()
    db.refresh(model)
    return model
