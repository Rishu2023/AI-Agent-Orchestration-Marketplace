import os
os.environ["TESTING"] = "1"

import uuid


def _user_id():
    return str(uuid.uuid4())


def test_create_api_key(client):
    uid = _user_id()
    response = client.post("/api/v1/billing/api-keys", json={
        "user_id": uid,
        "name": "My Test Key",
        "tier": "free",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == uid
    assert data["name"] == "My Test Key"
    assert data["tier"] == "free"
    assert "raw_key" in data
    assert len(data["raw_key"]) > 0
    assert "id" in data


def test_create_api_key_pro_tier(client):
    uid = _user_id()
    response = client.post("/api/v1/billing/api-keys", json={
        "user_id": uid,
        "name": "Pro Key",
        "tier": "pro",
    })
    assert response.status_code == 201
    assert response.json()["tier"] == "pro"


def test_list_api_keys(client):
    uid = _user_id()
    client.post("/api/v1/billing/api-keys", json={
        "user_id": uid,
        "name": "Key 1",
        "tier": "free",
    })
    client.post("/api/v1/billing/api-keys", json={
        "user_id": uid,
        "name": "Key 2",
        "tier": "pro",
    })
    response = client.get(f"/api/v1/billing/api-keys/{uid}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_list_api_keys_empty(client):
    uid = _user_id()
    response = client.get(f"/api/v1/billing/api-keys/{uid}")
    assert response.status_code == 200
    assert response.json() == []


def test_revoke_api_key(client):
    uid = _user_id()
    create_resp = client.post("/api/v1/billing/api-keys", json={
        "user_id": uid,
        "name": "Revoke Me",
        "tier": "free",
    })
    key_id = create_resp.json()["id"]
    response = client.delete(f"/api/v1/billing/api-keys/{key_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False


def test_revoke_api_key_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/billing/api-keys/{fake_id}")
    assert response.status_code == 404


def test_list_plans(client):
    response = client.get("/api/v1/billing/plans")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_usage(client):
    uid = _user_id()
    response = client.get(f"/api/v1/billing/usage/{uid}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == uid
    assert "total_requests" in data
    assert "total_tokens" in data
    assert "total_cost" in data
    assert "records" in data


def test_get_usage_with_period(client):
    uid = _user_id()
    for period in ("day", "week", "month"):
        response = client.get(f"/api/v1/billing/usage/{uid}?period={period}")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == uid
