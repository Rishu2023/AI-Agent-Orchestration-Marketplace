import os
os.environ["TESTING"] = "1"


def test_trigger_scan(client):
    response = client.post("/api/v1/research/scan")
    assert response.status_code == 200
    data = response.json()
    assert "papers_found" in data
    assert "models_found" in data
    assert "agents_created" in data
    assert "message" in data


def test_get_papers(client):
    # Trigger a scan first to populate data
    client.post("/api/v1/research/scan")
    response = client.get("/api/v1/research/papers")
    assert response.status_code == 200
    data = response.json()
    assert "papers" in data
    assert "total" in data


def test_get_papers_empty(client):
    response = client.get("/api/v1/research/papers")
    assert response.status_code == 200
    data = response.json()
    assert data["papers"] == []
    assert data["total"] == 0


def test_get_papers_with_limit(client):
    client.post("/api/v1/research/scan")
    response = client.get("/api/v1/research/papers?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["papers"]) <= 5


def test_get_trending(client):
    # Trigger a scan to populate trending models
    client.post("/api/v1/research/scan")
    response = client.get("/api/v1/research/trending")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "total" in data


def test_get_trending_empty(client):
    response = client.get("/api/v1/research/trending")
    assert response.status_code == 200
    data = response.json()
    assert data["models"] == []
    assert data["total"] == 0


def test_get_trending_with_limit(client):
    client.post("/api/v1/research/scan")
    response = client.get("/api/v1/research/trending?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["models"]) <= 3


def test_get_auto_agents(client):
    client.post("/api/v1/research/scan")
    response = client.get("/api/v1/research/auto-agents")
    assert response.status_code == 200
    data = response.json()
    assert "papers" in data
    assert "total" in data
