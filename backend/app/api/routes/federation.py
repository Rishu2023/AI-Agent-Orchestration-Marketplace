import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.federation import (
    FederationNodeCreate,
    FederationNodeResponse,
    FederationNodeListResponse,
    FederatedAgentResponse,
    FederatedAgentListResponse,
)
from app.services import federation_service

router = APIRouter(prefix="/federation", tags=["federation"])


@router.post("/nodes", response_model=FederationNodeResponse, status_code=201)
def register_node(
    node_data: FederationNodeCreate,
    db: Session = Depends(get_db),
):
    node = federation_service.register_node(db, node_data)
    return FederationNodeResponse.model_validate(node)


@router.get("/nodes", response_model=FederationNodeListResponse)
def list_nodes(db: Session = Depends(get_db)):
    nodes = federation_service.list_nodes(db)
    return FederationNodeListResponse(
        nodes=[FederationNodeResponse.model_validate(n) for n in nodes],
        total=len(nodes),
    )


@router.post("/nodes/{node_id}/sync", response_model=list[FederatedAgentResponse])
def sync_agents(node_id: uuid.UUID, db: Session = Depends(get_db)):
    agents = federation_service.sync_agents(db, node_id)
    return [FederatedAgentResponse.model_validate(a) for a in agents]


@router.post("/nodes/{node_id}/heartbeat", response_model=FederationNodeResponse)
def heartbeat(node_id: uuid.UUID, db: Session = Depends(get_db)):
    node = federation_service.health_check(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return FederationNodeResponse.model_validate(node)


@router.get("/agents", response_model=FederatedAgentListResponse)
def list_federated_agents(db: Session = Depends(get_db)):
    agents = federation_service.list_federated_agents(db)
    return FederatedAgentListResponse(
        agents=[FederatedAgentResponse.model_validate(a) for a in agents],
        total=len(agents),
    )


@router.delete("/nodes/{node_id}", status_code=204)
def remove_node(node_id: uuid.UUID, db: Session = Depends(get_db)):
    if not federation_service.remove_node(db, node_id):
        raise HTTPException(status_code=404, detail="Node not found")
