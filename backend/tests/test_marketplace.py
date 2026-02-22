import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def _seed_agent(client: AsyncClient) -> int:
    """Helper: create and publish a marketplace agent, return its id."""
    resp = await client.post("/api/v1/agents", json={
        "name": "Test Agent",
        "description": "A test agent for marketplace",
        "category": "Research",
        "pricing_type": "free",
        "price": 0.0,
        "system_prompt": "You are a helpful assistant.",
    })
    assert resp.status_code == 201
    agent_id = resp.json()["id"]
    pub = await client.post(f"/api/v1/agents/{agent_id}/publish")
    assert pub.status_code == 200
    return agent_id


async def test_list_categories(client):
    resp = await client.get("/api/v1/marketplace/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert "categories" in data
    assert len(data["categories"]) > 0
    assert "Research" in data["categories"]


async def test_marketplace_agents_empty(client):
    resp = await client.get("/api/v1/marketplace/agents")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


async def test_marketplace_agents_with_published(auth_client):
    agent_id = await _seed_agent(auth_client)
    resp = await auth_client.get("/api/v1/marketplace/agents")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == agent_id


async def test_marketplace_search(auth_client):
    await _seed_agent(auth_client)
    resp = await auth_client.get("/api/v1/marketplace/agents?search=Test")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1

    resp_no_match = await auth_client.get("/api/v1/marketplace/agents?search=xyznonexistent")
    assert resp_no_match.json()["total"] == 0


async def test_marketplace_filter_by_category(auth_client):
    await _seed_agent(auth_client)
    resp = await auth_client.get("/api/v1/marketplace/agents?category=Research")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1

    resp_wrong = await auth_client.get("/api/v1/marketplace/agents?category=Finance")
    assert resp_wrong.json()["total"] == 0


async def test_marketplace_filter_by_pricing(auth_client):
    await _seed_agent(auth_client)
    resp = await auth_client.get("/api/v1/marketplace/agents?pricing_type=free")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


async def test_marketplace_agent_detail(auth_client):
    agent_id = await _seed_agent(auth_client)
    resp = await auth_client.get(f"/api/v1/marketplace/agents/{agent_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == agent_id


async def test_marketplace_agent_detail_not_found(client):
    resp = await client.get("/api/v1/marketplace/agents/9999")
    assert resp.status_code == 404


async def test_featured_agents(auth_client):
    # No featured agents yet
    resp = await auth_client.get("/api/v1/marketplace/featured")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_marketplace_pagination(auth_client):
    resp = await auth_client.get("/api/v1/marketplace/agents?page=1&page_size=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["page"] == 1
    assert data["page_size"] == 5
