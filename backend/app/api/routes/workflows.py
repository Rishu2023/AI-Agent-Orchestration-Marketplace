import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowListResponse, WorkflowExecuteRequest, WorkflowExecutionResponse,
)
from app.services import orchestration_service

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("", response_model=WorkflowListResponse)
def list_workflows(
    is_template: Optional[bool] = None,
    is_public: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    workflows, total = orchestration_service.list_workflows(
        db, is_template=is_template, is_public=is_public,
        page=page, page_size=page_size,
    )
    return WorkflowListResponse(
        workflows=[WorkflowResponse.model_validate(w) for w in workflows],
        total=total, page=page, page_size=page_size,
    )


@router.get("/templates", response_model=WorkflowListResponse)
def list_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    workflows, total = orchestration_service.list_workflows(
        db, is_template=True, is_public=True,
        page=page, page_size=page_size,
    )
    return WorkflowListResponse(
        workflows=[WorkflowResponse.model_validate(w) for w in workflows],
        total=total, page=page, page_size=page_size,
    )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: uuid.UUID, db: Session = Depends(get_db)):
    workflow = orchestration_service.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowResponse.model_validate(workflow)


@router.post("", response_model=WorkflowResponse, status_code=201)
def create_workflow(
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_db),
):
    # In production, owner_id would come from authenticated user
    owner_id = uuid.uuid4()  # Placeholder
    workflow = orchestration_service.create_workflow(db, workflow_data, owner_id)
    return WorkflowResponse.model_validate(workflow)


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: uuid.UUID,
    workflow_data: WorkflowUpdate,
    db: Session = Depends(get_db),
):
    workflow = orchestration_service.update_workflow(db, workflow_id, workflow_data)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowResponse.model_validate(workflow)


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(workflow_id: uuid.UUID, db: Session = Depends(get_db)):
    if not orchestration_service.delete_workflow(db, workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")


@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
def execute_workflow(
    workflow_id: uuid.UUID,
    request: WorkflowExecuteRequest,
    db: Session = Depends(get_db),
):
    workflow = orchestration_service.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # In production, triggered_by would come from authenticated user
    triggered_by = uuid.uuid4()  # Placeholder
    execution = orchestration_service.start_execution(
        db, workflow_id=workflow_id,
        triggered_by=triggered_by,
        input_data=request.input_data,
    )
    return WorkflowExecutionResponse.model_validate(execution)


@router.get("/{workflow_id}/executions/{execution_id}", response_model=WorkflowExecutionResponse)
def get_execution(
    workflow_id: uuid.UUID,
    execution_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    execution = orchestration_service.get_execution(db, execution_id)
    if not execution or execution.workflow_id != workflow_id:
        raise HTTPException(status_code=404, detail="Execution not found")
    return WorkflowExecutionResponse.model_validate(execution)
