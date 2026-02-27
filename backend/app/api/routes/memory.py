import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.memory import (
    MemoryStoreRequest, MemoryUpdateRequest, MemoryResponse,
    MemoryListResponse, MemoryStatsResponse,
    KnowledgeCreateRequest, KnowledgeResponse, KnowledgeSearchResponse,
)
from app.services import memory_service

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("/store", response_model=MemoryResponse, status_code=201)
def store_memory(request: MemoryStoreRequest, db: Session = Depends(get_db)):
    memory = memory_service.store_memory(
        db,
        agent_id=request.agent_id,
        namespace=request.namespace,
        key=request.key,
        content=request.content,
        memory_type=request.memory_type,
        metadata_extra=request.metadata_extra,
    )
    return MemoryResponse.model_validate(memory)


@router.get("/knowledge/search", response_model=KnowledgeSearchResponse)
def search_knowledge(
    query: str = Query(...),
    category: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    results, total = memory_service.search_knowledge(db, query=query, category=category, limit=limit)
    return KnowledgeSearchResponse(
        results=[KnowledgeResponse.model_validate(r) for r in results],
        total=total,
    )


@router.post("/knowledge", response_model=KnowledgeResponse, status_code=201)
def add_knowledge(request: KnowledgeCreateRequest, db: Session = Depends(get_db)):
    knowledge = memory_service.add_knowledge(
        db,
        title=request.title,
        content=request.content,
        source=request.source,
        category=request.category,
        tags=request.tags,
    )
    return KnowledgeResponse.model_validate(knowledge)


@router.get("/{agent_id}/stats", response_model=MemoryStatsResponse)
def get_memory_stats(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    stats = memory_service.get_memory_stats(db, agent_id=agent_id)
    return MemoryStatsResponse(**stats)


@router.get("/{agent_id}/search", response_model=list[MemoryResponse])
def search_agent_memories(
    agent_id: uuid.UUID,
    query: str = Query(...),
    namespace: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    memories = memory_service.search_memories(
        db, agent_id=agent_id, query=query, namespace=namespace, limit=limit,
    )
    return [MemoryResponse.model_validate(m) for m in memories]


@router.get("/{agent_id}", response_model=MemoryListResponse)
def list_memories(
    agent_id: uuid.UUID,
    namespace: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    memories, total = memory_service.list_memories(
        db, agent_id=agent_id, namespace=namespace, page=page, page_size=page_size,
    )
    return MemoryListResponse(
        memories=[MemoryResponse.model_validate(m) for m in memories],
        total=total, page=page, page_size=page_size,
    )


@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: uuid.UUID,
    request: MemoryUpdateRequest,
    db: Session = Depends(get_db),
):
    memory = memory_service.update_memory(
        db, memory_id=memory_id, content=request.content, metadata_extra=request.metadata_extra,
    )
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return MemoryResponse.model_validate(memory)


@router.delete("/{memory_id}", status_code=204)
def delete_memory(memory_id: uuid.UUID, db: Session = Depends(get_db)):
    if not memory_service.delete_memory(db, memory_id):
        raise HTTPException(status_code=404, detail="Memory not found")
