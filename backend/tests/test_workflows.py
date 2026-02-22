import pytest


def test_create_workflow(client, sample_workflow_data):
    response = client.post("/api/v1/workflows", json=sample_workflow_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_workflow_data["name"]
    assert len(data["steps"]) == 2
    assert "id" in data
    assert "slug" in data


def test_get_workflow(client, sample_workflow_data):
    create_resp = client.post("/api/v1/workflows", json=sample_workflow_data)
    workflow_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/workflows/{workflow_id}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_workflow_data["name"]


def test_get_workflow_not_found(client):
    response = client.get("/api/v1/workflows/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_list_workflows(client, sample_workflow_data):
    client.post("/api/v1/workflows", json=sample_workflow_data)

    response = client.get("/api/v1/workflows")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


def test_update_workflow(client, sample_workflow_data):
    create_resp = client.post("/api/v1/workflows", json=sample_workflow_data)
    workflow_id = create_resp.json()["id"]

    response = client.put(f"/api/v1/workflows/{workflow_id}", json={
        "name": "Updated Workflow",
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Workflow"


def test_delete_workflow(client, sample_workflow_data):
    create_resp = client.post("/api/v1/workflows", json=sample_workflow_data)
    workflow_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/workflows/{workflow_id}")
    assert response.status_code == 204

    response = client.get(f"/api/v1/workflows/{workflow_id}")
    assert response.status_code == 404


def test_execute_workflow(client, sample_workflow_data):
    create_resp = client.post("/api/v1/workflows", json=sample_workflow_data)
    workflow_id = create_resp.json()["id"]

    response = client.post(f"/api/v1/workflows/{workflow_id}/execute", json={
        "input_data": {"topic": "AI research"},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["workflow_id"] == workflow_id


def test_get_execution(client, sample_workflow_data):
    create_resp = client.post("/api/v1/workflows", json=sample_workflow_data)
    workflow_id = create_resp.json()["id"]

    exec_resp = client.post(f"/api/v1/workflows/{workflow_id}/execute", json={
        "input_data": {"topic": "test"},
    })
    execution_id = exec_resp.json()["id"]

    response = client.get(f"/api/v1/workflows/{workflow_id}/executions/{execution_id}")
    assert response.status_code == 200
    assert response.json()["id"] == execution_id


def test_list_templates(client):
    response = client.get("/api/v1/workflows/templates")
    assert response.status_code == 200
    assert isinstance(response.json()["workflows"], list)
