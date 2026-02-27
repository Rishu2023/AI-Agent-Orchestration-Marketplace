import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.training import (
    TrainingJobCreateRequest, TrainingJobResponse, TrainingJobListResponse,
    FineTunedModelResponse, FineTunedModelListResponse,
)
from app.services import fine_tuning_service

router = APIRouter(prefix="/training", tags=["training"])


@router.post("/jobs", response_model=TrainingJobResponse, status_code=201)
def create_training_job(
    request: TrainingJobCreateRequest,
    db: Session = Depends(get_db),
):
    # In production, user_id would come from authenticated user
    user_id = uuid.uuid4()
    job = fine_tuning_service.create_training_job(
        db,
        user_id=user_id,
        model_name=request.model_name,
        base_model=request.base_model,
        dataset_name=request.dataset_name,
        config=request.config,
        dataset_path=request.dataset_path,
        dataset_size=request.dataset_size,
    )
    return TrainingJobResponse.model_validate(job)


@router.post("/jobs/{job_id}/start", response_model=TrainingJobResponse)
def start_training(job_id: uuid.UUID, db: Session = Depends(get_db)):
    job = fine_tuning_service.start_training(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    return TrainingJobResponse.model_validate(job)


@router.get("/jobs/{job_id}", response_model=TrainingJobResponse)
def get_job_status(job_id: uuid.UUID, db: Session = Depends(get_db)):
    job = fine_tuning_service.get_job_status(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Training job not found")
    return TrainingJobResponse.model_validate(job)


@router.get("/jobs", response_model=TrainingJobListResponse)
def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    jobs, total = fine_tuning_service.list_jobs(db, page=page, page_size=page_size)
    return TrainingJobListResponse(
        jobs=[TrainingJobResponse.model_validate(j) for j in jobs],
        total=total, page=page, page_size=page_size,
    )


@router.get("/models", response_model=FineTunedModelListResponse)
def list_models(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    models, total = fine_tuning_service.list_models(db, page=page, page_size=page_size)
    return FineTunedModelListResponse(
        models=[FineTunedModelResponse.model_validate(m) for m in models],
        total=total, page=page, page_size=page_size,
    )


@router.post("/models/{model_id}/publish", response_model=FineTunedModelResponse)
def publish_model(model_id: uuid.UUID, db: Session = Depends(get_db)):
    model = fine_tuning_service.publish_model(db, model_id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return FineTunedModelResponse.model_validate(model)
