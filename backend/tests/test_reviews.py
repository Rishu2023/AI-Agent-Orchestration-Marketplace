import pytest


def test_create_review(client, sample_agent_data):
    # Create an agent first
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.post(f"/api/v1/agents/{agent_id}/reviews", json={
        "rating": 5,
        "title": "Great agent!",
        "content": "This agent is very helpful.",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 5
    assert data["title"] == "Great agent!"
    assert data["content"] == "This agent is very helpful."
    assert data["agent_id"] == agent_id


def test_create_review_invalid_rating(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    # Rating must be 1-5
    response = client.post(f"/api/v1/agents/{agent_id}/reviews", json={
        "rating": 6,
    })
    assert response.status_code == 422


def test_create_review_agent_not_found(client):
    response = client.post(
        "/api/v1/agents/00000000-0000-0000-0000-000000000000/reviews",
        json={"rating": 5},
    )
    assert response.status_code == 404


def test_list_reviews(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    # Create two reviews
    client.post(f"/api/v1/agents/{agent_id}/reviews", json={
        "rating": 5,
        "title": "Excellent",
    })
    client.post(f"/api/v1/agents/{agent_id}/reviews", json={
        "rating": 3,
        "title": "Average",
    })

    response = client.get(f"/api/v1/agents/{agent_id}/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["reviews"]) == 2
    assert data["average_rating"] == 4.0


def test_list_reviews_empty(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/agents/{agent_id}/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["reviews"] == []
    assert data["average_rating"] == 0.0


def test_list_reviews_agent_not_found(client):
    response = client.get(
        "/api/v1/agents/00000000-0000-0000-0000-000000000000/reviews"
    )
    assert response.status_code == 404


def test_review_updates_agent_rating(client, sample_agent_data):
    create_resp = client.post("/api/v1/agents", json=sample_agent_data)
    agent_id = create_resp.json()["id"]

    client.post(f"/api/v1/agents/{agent_id}/reviews", json={"rating": 4})
    client.post(f"/api/v1/agents/{agent_id}/reviews", json={"rating": 5})

    # Check agent rating was updated
    agent_resp = client.get(f"/api/v1/agents/{agent_id}")
    assert agent_resp.status_code == 200
    agent_data = agent_resp.json()
    assert agent_data["average_rating"] == 4.5
    assert agent_data["total_reviews"] == 2
