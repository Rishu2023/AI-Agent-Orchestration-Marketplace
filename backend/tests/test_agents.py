import pytest


def test_create_agent(client, sample_agent_data):
    response = client.post("/api/v1/agents", json=sample_agent_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_agent_data["name"]
    assert data["description"] == sample_agent_data["description"]
    assert data["category"] == "research"
    assert data["status"] == "draft"
    assert "id" in data
    assert "slug" in data


def test_create_agent_missing_name(client):
    response = client.post("/api/v1/agents", json={
        "description": "A test agent that does some things for you.",
    })
    assert response.status_code == 422


def test_create_agent_short_description(client):
    response = client.post("/api/v1/agents", json={
        "name": "Test",
        "description": "Short",
    })
    assert response.status_code == 422


def test_get_agent(client, sample_agent_data):
    # Create first
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    # Get
    response = client.get(f"/api/v1/agents/{agent_id}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_agent_data["name"]


def test_get_agent_not_found(client):
    response = client.get("/api/v1/agents/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_list_agents_empty(client):
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    data = response.json()
    assert data["agents"] == []
    assert data["total"] == 0


def test_list_agents_with_published(client, sample_agent_data):
    # Create and publish an agent
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    # List (default shows only published)
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["agents"]) == 1


def test_update_agent(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.put(f"/api/v1/agents/{agent_id}", json={
        "name": "Updated Agent Name",
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Agent Name"


def test_publish_agent(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.post(f"/api/v1/agents/{agent_id}/publish")
    assert response.status_code == 200
    assert response.json()["status"] == "published"
    assert response.json()["published_at"] is not None


def test_delete_agent(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/agents/{agent_id}")
    assert response.status_code == 204

    # Verify deleted
    response = client.get(f"/api/v1/agents/{agent_id}")
    assert response.status_code == 404


def test_execute_agent(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.post(f"/api/v1/agents/{agent_id}/execute", json={
        "input": {"query": "test query"},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "execution_id" in data
    assert data["output"] is not None


def test_featured_agents(client):
    response = client.get("/api/v1/agents/featured")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_popular_agents(client):
    response = client.get("/api/v1/agents/popular")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_search_agents(client, sample_agent_data):
    # Create and publish
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    # Search by name
    response = client.get("/api/v1/agents?search=Research")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1

    # Search no match
    response = client.get("/api/v1/agents?search=nonexistent")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_filter_agents_by_category(client, sample_agent_data):
    # Create and publish
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    # Filter by category
    response = client.get("/api/v1/agents?category=research")
    assert response.status_code == 200
    assert response.json()["total"] == 1

    response = client.get("/api/v1/agents?category=coding")
    assert response.status_code == 200
    assert response.json()["total"] == 0
