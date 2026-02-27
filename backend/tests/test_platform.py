import os
os.environ["TESTING"] = "1"


def test_get_platform_stats(client):
    response = client.get("/api/v1/platform/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_agents" in data
    assert "total_federated_agents" in data
    assert "total_users" in data
    assert "total_workflows" in data
    assert "executions_today" in data
    assert "executions_week" in data
    assert "executions_month" in data
    assert "total_credits_supply" in data
    assert "credits_velocity" in data
    assert "federation_nodes_count" in data


def test_get_platform_stats_values(client):
    response = client.get("/api/v1/platform/stats")
    data = response.json()
    assert data["total_agents"] >= 0
    assert data["total_users"] >= 0
    assert data["total_workflows"] >= 0


def test_get_snapshot_history(client):
    response = client.get("/api/v1/platform/stats/history")
    assert response.status_code == 200
    data = response.json()
    assert "snapshots" in data
    assert "total" in data


def test_get_snapshot_history_with_days(client):
    response = client.get("/api/v1/platform/stats/history?days=7")
    assert response.status_code == 200
    data = response.json()
    assert "snapshots" in data
    assert "total" in data


def test_get_snapshot_history_empty(client):
    response = client.get("/api/v1/platform/stats/history?days=1")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 0
