import os
os.environ["TESTING"] = "1"

import uuid


def _agent_id():
    return str(uuid.uuid4())


def _store_memory(client, agent_id=None, namespace="default", key="test-key",
                   content="test content", memory_type="episodic"):
    return client.post("/api/v1/memory/store", json={
        "agent_id": agent_id,
        "namespace": namespace,
        "key": key,
        "content": content,
        "memory_type": memory_type,
        "metadata_extra": {"source": "test"},
    })


def test_store_memory(client):
    aid = _agent_id()
    response = _store_memory(client, agent_id=aid)
    assert response.status_code == 201
    data = response.json()
    assert data["agent_id"] == aid
    assert data["namespace"] == "default"
    assert data["key"] == "test-key"
    assert data["content"] == "test content"
    assert data["memory_type"] == "episodic"
    assert "id" in data


def test_store_memory_without_agent(client):
    response = _store_memory(client, agent_id=None, key="global-key")
    assert response.status_code == 201
    assert response.json()["agent_id"] is None


def test_list_memories(client):
    aid = _agent_id()
    _store_memory(client, agent_id=aid, key="mem1", content="first")
    _store_memory(client, agent_id=aid, key="mem2", content="second")
    response = client.get(f"/api/v1/memory/{aid}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["memories"]) >= 2


def test_list_memories_empty(client):
    aid = _agent_id()
    response = client.get(f"/api/v1/memory/{aid}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["memories"] == []


def test_list_memories_with_namespace(client):
    aid = _agent_id()
    _store_memory(client, agent_id=aid, namespace="ns1", key="k1")
    _store_memory(client, agent_id=aid, namespace="ns2", key="k2")
    response = client.get(f"/api/v1/memory/{aid}?namespace=ns1")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for mem in data["memories"]:
        assert mem["namespace"] == "ns1"


def test_search_memories(client):
    aid = _agent_id()
    _store_memory(client, agent_id=aid, key="search-test", content="machine learning research")
    _store_memory(client, agent_id=aid, key="other", content="something else entirely")
    response = client.get(f"/api/v1/memory/{aid}/search?query=machine")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_memory(client):
    aid = _agent_id()
    create_resp = _store_memory(client, agent_id=aid, content="original")
    memory_id = create_resp.json()["id"]
    response = client.put(f"/api/v1/memory/{memory_id}", json={
        "content": "updated content",
        "metadata_extra": {"updated": True},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "updated content"


def test_update_memory_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.put(f"/api/v1/memory/{fake_id}", json={
        "content": "updated",
    })
    assert response.status_code == 404


def test_delete_memory(client):
    aid = _agent_id()
    create_resp = _store_memory(client, agent_id=aid)
    memory_id = create_resp.json()["id"]
    response = client.delete(f"/api/v1/memory/{memory_id}")
    assert response.status_code == 204

    # Verify it's gone
    list_resp = client.get(f"/api/v1/memory/{aid}")
    assert list_resp.json()["total"] == 0


def test_delete_memory_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/memory/{fake_id}")
    assert response.status_code == 404


def test_add_knowledge(client):
    response = client.post("/api/v1/memory/knowledge", json={
        "title": "Test Knowledge Article",
        "content": "This is knowledge about AI agents.",
        "source": "test-suite",
        "category": "ai",
        "tags": ["test", "ai"],
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Knowledge Article"
    assert data["category"] == "ai"
    assert "id" in data


def test_search_knowledge(client):
    client.post("/api/v1/memory/knowledge", json={
        "title": "Neural Networks",
        "content": "Deep learning fundamentals for neural network architectures.",
        "category": "ml",
        "tags": ["deep-learning"],
    })
    response = client.get("/api/v1/memory/knowledge/search?query=neural")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data


def test_search_knowledge_with_category(client):
    client.post("/api/v1/memory/knowledge", json={
        "title": "Python Basics",
        "content": "Introduction to Python programming.",
        "category": "programming",
        "tags": ["python"],
    })
    response = client.get("/api/v1/memory/knowledge/search?query=python&category=programming")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data


def test_memory_stats(client):
    aid = _agent_id()
    _store_memory(client, agent_id=aid, key="k1", memory_type="episodic")
    _store_memory(client, agent_id=aid, key="k2", memory_type="episodic", namespace="facts")
    response = client.get(f"/api/v1/memory/{aid}/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_memories"] >= 2
    assert "by_type" in data
    assert "by_namespace" in data
