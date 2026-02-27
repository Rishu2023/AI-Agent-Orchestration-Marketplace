import os
os.environ["TESTING"] = "1"

import uuid


def _user_id():
    return str(uuid.uuid4())


def test_get_balance_auto_creates(client):
    uid = _user_id()
    response = client.get(f"/api/v1/economy/balance/{uid}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == uid
    assert data["balance"] == 100.0
    assert data["total_earned"] == 0.0
    assert data["total_spent"] == 0.0


def test_get_balance_idempotent(client):
    uid = _user_id()
    resp1 = client.get(f"/api/v1/economy/balance/{uid}")
    resp2 = client.get(f"/api/v1/economy/balance/{uid}")
    assert resp1.json()["id"] == resp2.json()["id"]


def test_add_credits(client):
    uid = _user_id()
    # Ensure account exists
    client.get(f"/api/v1/economy/balance/{uid}")
    response = client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 100.0,
        "transaction_type": "bonus",
        "description": "Welcome bonus",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    assert data["transaction_type"] == "bonus"

    # Check balance updated (100 initial + 100 added)
    balance_resp = client.get(f"/api/v1/economy/balance/{uid}")
    assert balance_resp.json()["balance"] == 200.0


def test_spend_credits(client):
    uid = _user_id()
    client.get(f"/api/v1/economy/balance/{uid}")
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 50.0,
        "transaction_type": "bonus",
        "description": "Top up",
    })
    response = client.post("/api/v1/economy/credits/spend", json={
        "user_id": uid,
        "amount": 30.0,
        "description": "Agent usage",
    })
    assert response.status_code == 200
    assert response.json()["amount"] == 30.0

    balance_resp = client.get(f"/api/v1/economy/balance/{uid}")
    assert balance_resp.json()["balance"] == 120.0


def test_spend_more_than_balance_fails(client):
    uid = _user_id()
    client.get(f"/api/v1/economy/balance/{uid}")
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 10.0,
        "transaction_type": "bonus",
        "description": "Small deposit",
    })
    response = client.post("/api/v1/economy/credits/spend", json={
        "user_id": uid,
        "amount": 999.0,
        "description": "Too much",
    })
    assert response.status_code == 400
    assert "Insufficient" in response.json()["detail"]


def test_get_transactions(client):
    uid = _user_id()
    client.get(f"/api/v1/economy/balance/{uid}")
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 50.0,
        "transaction_type": "bonus",
        "description": "Bonus 1",
    })
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 25.0,
        "transaction_type": "earned",
        "description": "Bonus 2",
    })
    response = client.get(f"/api/v1/economy/transactions/{uid}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["transactions"]) >= 2


def test_get_transactions_empty(client):
    uid = _user_id()
    response = client.get(f"/api/v1/economy/transactions/{uid}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["transactions"] == []


def test_leaderboard(client):
    response = client.get("/api/v1/economy/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data


def test_leaderboard_with_data(client):
    uid1 = _user_id()
    uid2 = _user_id()
    client.get(f"/api/v1/economy/balance/{uid1}")
    client.get(f"/api/v1/economy/balance/{uid2}")
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid1,
        "amount": 200.0,
        "transaction_type": "earned",
        "description": "Agent earnings",
    })
    client.post("/api/v1/economy/credits/add", json={
        "user_id": uid2,
        "amount": 100.0,
        "transaction_type": "earned",
        "description": "Agent earnings",
    })
    response = client.get("/api/v1/economy/leaderboard?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) >= 2


def test_add_credits_refund_type(client):
    uid = _user_id()
    client.get(f"/api/v1/economy/balance/{uid}")
    response = client.post("/api/v1/economy/credits/add", json={
        "user_id": uid,
        "amount": 15.0,
        "transaction_type": "refund",
        "description": "Refund for failed task",
    })
    assert response.status_code == 201
    assert response.json()["transaction_type"] == "refund"
