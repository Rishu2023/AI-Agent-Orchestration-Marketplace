import pytest

pytestmark = pytest.mark.asyncio

WORKFLOW_PAYLOAD = {
    "name": "My Workflow",
    "description": "Test workflow",
    "nodes": '[{"id":"1","type":"agent","data":{"label":"Start"}}]',
    "edges": "[]",
}


async def test_create_workflow_requires_auth(client):
    resp = await client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    assert resp.status_code == 401


async def test_create_workflow(auth_client):
    resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == WORKFLOW_PAYLOAD["name"]
    assert data["is_published"] is False


async def test_list_workflows(auth_client):
    await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    resp = await auth_client.get("/api/v1/workflows")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


async def test_get_workflow(auth_client):
    create_resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    wf_id = create_resp.json()["id"]
    resp = await auth_client.get(f"/api/v1/workflows/{wf_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == wf_id


async def test_update_workflow(auth_client):
    create_resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    wf_id = create_resp.json()["id"]
    resp = await auth_client.put(f"/api/v1/workflows/{wf_id}", json={"name": "Updated Workflow"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Workflow"


async def test_delete_workflow(auth_client):
    create_resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    wf_id = create_resp.json()["id"]
    del_resp = await auth_client.delete(f"/api/v1/workflows/{wf_id}")
    assert del_resp.status_code == 204
    get_resp = await auth_client.get(f"/api/v1/workflows/{wf_id}")
    assert get_resp.status_code == 404


async def test_execute_workflow(auth_client):
    create_resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    wf_id = create_resp.json()["id"]
    exec_resp = await auth_client.post(f"/api/v1/workflows/{wf_id}/execute")
    assert exec_resp.status_code == 200
    data = exec_resp.json()
    assert data["status"] == "completed"
    assert "execution_id" in data


async def test_get_workflow_not_found(auth_client):
    resp = await auth_client.get("/api/v1/workflows/9999")
    assert resp.status_code == 404


async def test_workflow_preserves_nodes(auth_client):
    resp = await auth_client.post("/api/v1/workflows", json=WORKFLOW_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["nodes"] == WORKFLOW_PAYLOAD["nodes"]
    assert data["edges"] == WORKFLOW_PAYLOAD["edges"]
