import os
os.environ["TESTING"] = "1"

import uuid


def _node_data(name="Test Node", url=None):
    return {
        "name": name,
        "url": url or f"https://{uuid.uuid4().hex[:8]}.example.com",
        "api_key": "test-api-key-12345",
        "location": {"region": "us-east-1"},
    }


def test_register_node(client):
    response = client.post("/api/v1/federation/nodes", json=_node_data())
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Node"
    assert data["status"] == "active"
    assert "id" in data


def test_list_nodes_empty(client):
    response = client.get("/api/v1/federation/nodes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["nodes"] == []


def test_list_nodes_with_data(client):
    client.post("/api/v1/federation/nodes", json=_node_data("Node A"))
    client.post("/api/v1/federation/nodes", json=_node_data("Node B"))
    response = client.get("/api/v1/federation/nodes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["nodes"]) == 2


def test_heartbeat(client):
    create_resp = client.post("/api/v1/federation/nodes", json=_node_data())
    node_id = create_resp.json()["id"]
    response = client.post(f"/api/v1/federation/nodes/{node_id}/heartbeat")
    assert response.status_code == 200
    assert response.json()["id"] == node_id


def test_heartbeat_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.post(f"/api/v1/federation/nodes/{fake_id}/heartbeat")
    assert response.status_code == 404


def test_list_federated_agents_empty(client):
    response = client.get("/api/v1/federation/agents")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["agents"] == []


def test_remove_node(client):
    create_resp = client.post("/api/v1/federation/nodes", json=_node_data())
    node_id = create_resp.json()["id"]
    response = client.delete(f"/api/v1/federation/nodes/{node_id}")
    assert response.status_code == 204

    # Verify node is gone
    list_resp = client.get("/api/v1/federation/nodes")
    assert list_resp.json()["total"] == 0


def test_remove_node_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/federation/nodes/{fake_id}")
    assert response.status_code == 404


def test_sync_agents(client):
    create_resp = client.post("/api/v1/federation/nodes", json=_node_data())
    node_id = create_resp.json()["id"]
    response = client.post(f"/api/v1/federation/nodes/{node_id}/sync")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
