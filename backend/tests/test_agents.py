import pytest

pytestmark = pytest.mark.asyncio

AGENT_PAYLOAD = {
    "name": "My Agent",
    "description": "Does amazing things",
    "category": "Code Assistant",
    "pricing_type": "free",
    "price": 0.0,
    "system_prompt": "You are a code assistant.",
}


async def test_create_agent_requires_auth(client):
    resp = await client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    assert resp.status_code == 401


async def test_create_agent(auth_client):
    resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == AGENT_PAYLOAD["name"]
    assert data["is_published"] is False


async def test_list_my_agents(auth_client):
    await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    resp = await auth_client.get("/api/v1/agents")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


async def test_get_agent(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    resp = await auth_client.get(f"/api/v1/agents/{agent_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == agent_id


async def test_update_agent(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    resp = await auth_client.put(f"/api/v1/agents/{agent_id}", json={"name": "Updated Agent"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Agent"


async def test_delete_agent(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    del_resp = await auth_client.delete(f"/api/v1/agents/{agent_id}")
    assert del_resp.status_code == 204
    get_resp = await auth_client.get(f"/api/v1/agents/{agent_id}")
    assert get_resp.status_code == 404


async def test_publish_agent(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    pub_resp = await auth_client.post(f"/api/v1/agents/{agent_id}/publish")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["is_published"] is True


async def test_execute_published_agent(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    await auth_client.post(f"/api/v1/agents/{agent_id}/publish")

    exec_resp = await auth_client.post(
        f"/api/v1/agents/{agent_id}/execute",
        json={"input_data": '{"prompt": "Hello!"}'},
    )
    assert exec_resp.status_code == 200
    data = exec_resp.json()
    assert data["status"] == "completed"
    assert data["tokens_used"] > 0


async def test_execute_unpublished_agent_fails(auth_client):
    create_resp = await auth_client.post("/api/v1/agents", json=AGENT_PAYLOAD)
    agent_id = create_resp.json()["id"]
    exec_resp = await auth_client.post(
        f"/api/v1/agents/{agent_id}/execute",
        json={"input_data": "test"},
    )
    assert exec_resp.status_code == 404


async def test_invalid_pricing_type(auth_client):
    payload = {**AGENT_PAYLOAD, "pricing_type": "invalid"}
    resp = await auth_client.post("/api/v1/agents", json=payload)
    assert resp.status_code == 422


async def test_negative_price(auth_client):
    payload = {**AGENT_PAYLOAD, "price": -1.0}
    resp = await auth_client.post("/api/v1/agents", json=payload)
    assert resp.status_code == 422
