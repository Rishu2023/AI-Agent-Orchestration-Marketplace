import pytest


def test_trending_agents(client):
    response = client.get("/api/v1/agents/trending")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_new_arrivals(client):
    response = client.get("/api/v1/agents/new")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_filter_agents_by_pricing_model(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    response = client.get("/api/v1/agents?pricing_model=free")
    assert response.status_code == 200
    assert response.json()["total"] == 1

    response = client.get("/api/v1/agents?pricing_model=subscription")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_filter_agents_by_provider(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    response = client.get("/api/v1/agents?provider=openai")
    assert response.status_code == 200
    assert response.json()["total"] == 1

    response = client.get("/api/v1/agents?provider=anthropic")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_sort_agents_by_rating(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    response = client.get("/api/v1/agents?sort_by=rating")
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_sort_agents_by_popular(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    response = client.get("/api/v1/agents?sort_by=popular")
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_combined_filters(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]
    client.post(f"/api/v1/agents/{agent_id}/publish")

    response = client.get(
        "/api/v1/agents?category=research&provider=openai&pricing_model=free&sort_by=rating"
    )
    assert response.status_code == 200
    assert response.json()["total"] == 1

    response = client.get(
        "/api/v1/agents?category=research&provider=anthropic"
    )
    assert response.status_code == 200
    assert response.json()["total"] == 0
