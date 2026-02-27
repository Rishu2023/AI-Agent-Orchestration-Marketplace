import uuid
import hashlib
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.memory import AgentMemory, KnowledgeBase


def _generate_embedding(text: str) -> List[float]:
    """Generate a simple hash-based embedding vector for text."""
    embedding = []
    for i in range(32):
        chunk = f"{text}:{i}"
        h = hashlib.md5(chunk.encode()).hexdigest()
        value = (int(h[:8], 16) / 0xFFFFFFFF) * 2 - 1
        embedding.append(round(value, 6))
    return embedding


def store_memory(
    db: Session,
    agent_id: Optional[uuid.UUID],
    namespace: str,
    key: str,
    content: str,
    memory_type: str = "episodic",
    metadata_extra: Optional[Dict[str, Any]] = None,
) -> AgentMemory:
    embedding = _generate_embedding(content)
    memory = AgentMemory(
        agent_id=agent_id,
        namespace=namespace,
        key=key,
        content=content,
        embedding=embedding,
        memory_type=memory_type,
        metadata_extra=metadata_extra or {},
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def retrieve_memories(
    db: Session,
    agent_id: Optional[uuid.UUID],
    query: str,
    limit: int = 10,
) -> List[AgentMemory]:
    q = db.query(AgentMemory)
    if agent_id:
        q = q.filter(AgentMemory.agent_id == agent_id)
    search_term = f"%{query}%"
    q = q.filter(
        or_(
            AgentMemory.content.ilike(search_term),
            AgentMemory.key.ilike(search_term),
        )
    )
    memories = q.order_by(AgentMemory.access_count.desc()).limit(limit).all()
    for mem in memories:
        mem.access_count += 1
    db.commit()
    return memories


def search_memories(
    db: Session,
    agent_id: Optional[uuid.UUID],
    query: str,
    namespace: Optional[str] = None,
    limit: int = 10,
) -> List[AgentMemory]:
    q = db.query(AgentMemory)
    if agent_id:
        q = q.filter(AgentMemory.agent_id == agent_id)
    if namespace:
        q = q.filter(AgentMemory.namespace == namespace)
    search_term = f"%{query}%"
    q = q.filter(
        or_(
            AgentMemory.content.ilike(search_term),
            AgentMemory.key.ilike(search_term),
            AgentMemory.namespace.ilike(search_term),
        )
    )
    return q.order_by(AgentMemory.updated_at.desc()).limit(limit).all()


def delete_memory(db: Session, memory_id: uuid.UUID) -> bool:
    memory = db.query(AgentMemory).filter(AgentMemory.id == memory_id).first()
    if not memory:
        return False
    db.delete(memory)
    db.commit()
    return True


def update_memory(
    db: Session,
    memory_id: uuid.UUID,
    content: str,
    metadata_extra: Optional[Dict[str, Any]] = None,
) -> Optional[AgentMemory]:
    memory = db.query(AgentMemory).filter(AgentMemory.id == memory_id).first()
    if not memory:
        return None
    memory.content = content
    memory.embedding = _generate_embedding(content)
    memory.updated_at = datetime.utcnow()
    if metadata_extra is not None:
        memory.metadata_extra = metadata_extra
    db.commit()
    db.refresh(memory)
    return memory


def list_memories(
    db: Session,
    agent_id: Optional[uuid.UUID],
    namespace: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[AgentMemory], int]:
    q = db.query(AgentMemory)
    if agent_id:
        q = q.filter(AgentMemory.agent_id == agent_id)
    if namespace:
        q = q.filter(AgentMemory.namespace == namespace)
    total = q.count()
    memories = (
        q.order_by(AgentMemory.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return memories, total


def add_knowledge(
    db: Session,
    title: str,
    content: str,
    source: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> KnowledgeBase:
    embedding = _generate_embedding(content)
    knowledge = KnowledgeBase(
        title=title,
        content=content,
        source=source,
        category=category,
        embedding=embedding,
        tags=tags or [],
    )
    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)
    return knowledge


def search_knowledge(
    db: Session,
    query: str,
    category: Optional[str] = None,
    limit: int = 10,
) -> Tuple[List[KnowledgeBase], int]:
    q = db.query(KnowledgeBase)
    if category:
        q = q.filter(KnowledgeBase.category == category)
    search_term = f"%{query}%"
    q = q.filter(
        or_(
            KnowledgeBase.title.ilike(search_term),
            KnowledgeBase.content.ilike(search_term),
        )
    )
    total = q.count()
    results = q.order_by(KnowledgeBase.created_at.desc()).limit(limit).all()
    return results, total


def get_memory_stats(db: Session, agent_id: Optional[uuid.UUID]) -> Dict[str, Any]:
    q = db.query(AgentMemory)
    if agent_id:
        q = q.filter(AgentMemory.agent_id == agent_id)

    total_memories = q.count()
    total_access = q.with_entities(func.coalesce(func.sum(AgentMemory.access_count), 0)).scalar()

    type_counts = (
        q.with_entities(AgentMemory.memory_type, func.count(AgentMemory.id))
        .group_by(AgentMemory.memory_type)
        .all()
    )
    by_type = {t: c for t, c in type_counts}

    ns_counts = (
        q.with_entities(AgentMemory.namespace, func.count(AgentMemory.id))
        .group_by(AgentMemory.namespace)
        .all()
    )
    by_namespace = {n: c for n, c in ns_counts}

    return {
        "total_memories": total_memories,
        "by_type": by_type,
        "by_namespace": by_namespace,
        "total_access_count": total_access,
    }
