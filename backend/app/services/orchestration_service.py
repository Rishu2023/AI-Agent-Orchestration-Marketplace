import uuid
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.workflow import (
    Workflow, WorkflowStep, WorkflowExecution,
    WorkflowStatus, ExecutionStatus, StepType,
)
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate
from app.services.utils import generate_slug


def create_workflow(db: Session, workflow_data: WorkflowCreate, owner_id: uuid.UUID) -> Workflow:
    workflow = Workflow(
        name=workflow_data.name,
        slug=generate_slug(workflow_data.name),
        description=workflow_data.description,
        owner_id=owner_id,
        variables=workflow_data.variables,
        is_template=workflow_data.is_template,
        is_public=workflow_data.is_public,
        status=WorkflowStatus.DRAFT.value,
    )
    db.add(workflow)
    db.flush()

    for step_data in workflow_data.steps:
        step = WorkflowStep(
            workflow_id=workflow.id,
            name=step_data.name,
            step_type=step_data.step_type,
            position=step_data.position,
            agent_id=step_data.agent_id,
            config=step_data.config,
            input_mapping=step_data.input_mapping,
            output_mapping=step_data.output_mapping,
            condition=step_data.condition,
            position_x=step_data.position_x,
            position_y=step_data.position_y,
        )
        db.add(step)

    db.commit()
    db.refresh(workflow)
    return workflow


def get_workflow(db: Session, workflow_id: uuid.UUID) -> Optional[Workflow]:
    return db.query(Workflow).filter(Workflow.id == workflow_id).first()


def list_workflows(
    db: Session,
    owner_id: Optional[uuid.UUID] = None,
    is_template: Optional[bool] = None,
    is_public: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Workflow], int]:
    query = db.query(Workflow)

    if owner_id:
        query = query.filter(Workflow.owner_id == owner_id)
    if is_template is not None:
        query = query.filter(Workflow.is_template == is_template)
    if is_public is not None:
        query = query.filter(Workflow.is_public == is_public)

    total = query.count()
    workflows = query.order_by(Workflow.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return workflows, total


def update_workflow(db: Session, workflow_id: uuid.UUID, data: WorkflowUpdate) -> Optional[Workflow]:
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        return None

    update_data = data.model_dump(exclude_unset=True)

    if "steps" in update_data and update_data["steps"] is not None:
        db.query(WorkflowStep).filter(WorkflowStep.workflow_id == workflow_id).delete()
        for step_data in data.steps:
            step = WorkflowStep(
                workflow_id=workflow.id,
                name=step_data.name,
                step_type=step_data.step_type,
                position=step_data.position,
                agent_id=step_data.agent_id,
                config=step_data.config,
                input_mapping=step_data.input_mapping,
                output_mapping=step_data.output_mapping,
                condition=step_data.condition,
                position_x=step_data.position_x,
                position_y=step_data.position_y,
            )
            db.add(step)
        del update_data["steps"]

    for field, value in update_data.items():
        setattr(workflow, field, value)

    db.commit()
    db.refresh(workflow)
    return workflow


def delete_workflow(db: Session, workflow_id: uuid.UUID) -> bool:
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        return False

    db.query(WorkflowStep).filter(WorkflowStep.workflow_id == workflow_id).delete()
    db.delete(workflow)
    db.commit()
    return True


def start_execution(
    db: Session,
    workflow_id: uuid.UUID,
    triggered_by: uuid.UUID,
    input_data: Dict[str, Any],
) -> WorkflowExecution:
    execution = WorkflowExecution(
        workflow_id=workflow_id,
        triggered_by=triggered_by,
        status=ExecutionStatus.PENDING.value,
        input_data=input_data,
        started_at=datetime.utcnow(),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution


def get_execution(db: Session, execution_id: uuid.UUID) -> Optional[WorkflowExecution]:
    return db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()


def update_execution_status(
    db: Session,
    execution_id: uuid.UUID,
    status: str,
    step_result: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    output_data: Optional[Dict[str, Any]] = None,
) -> Optional[WorkflowExecution]:
    execution = get_execution(db, execution_id)
    if not execution:
        return None

    execution.status = status

    if step_result:
        results = execution.step_results or []
        results.append(step_result)
        execution.step_results = results
        execution.current_step = len(results)

    if error_message:
        execution.error_message = error_message

    if output_data:
        execution.output_data = output_data

    if status in [ExecutionStatus.COMPLETED.value, ExecutionStatus.FAILED.value]:
        execution.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(execution)
    return execution
