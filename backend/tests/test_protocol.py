import os
os.environ["TESTING"] = "1"

import uuid


def test_protocol_version(client):
    response = client.get("/api/v1/protocol/version")
    assert response.status_code == 200
    data = response.json()
    assert data["protocol"] == "AACP"
    assert data["version"] == "1.0"


def test_protocol_spec(client):
    response = client.get("/api/v1/protocol/spec")
    assert response.status_code == 200
    data = response.json()
    assert data["protocol"] == "AACP"
    assert data["version"] == "1.0"
    assert "message_types" in data
    assert "request" in data["message_types"]
    assert "response" in data["message_types"]
    assert "notification" in data["message_types"]
    assert "endpoints" in data


def test_send_message(client):
    sender_id = str(uuid.uuid4())
    receiver_id = str(uuid.uuid4())
    response = client.post("/api/v1/protocol/messages", json={
        "sender_agent_id": sender_id,
        "receiver_agent_id": receiver_id,
        "message_type": "request",
        "content": {"task": "analyze", "data": "test data"},
    })
    assert response.status_code == 201
    data = response.json()
    assert data["sender_agent_id"] == sender_id
    assert data["receiver_agent_id"] == receiver_id
    assert data["message_type"] == "request"
    assert data["content"] == {"task": "analyze", "data": "test data"}
    assert "id" in data
    assert "status" in data


def test_send_message_with_correlation_id(client):
    sender_id = str(uuid.uuid4())
    receiver_id = str(uuid.uuid4())
    response = client.post("/api/v1/protocol/messages", json={
        "sender_agent_id": sender_id,
        "receiver_agent_id": receiver_id,
        "message_type": "response",
        "content": {"result": "done"},
        "correlation_id": "corr-12345",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["correlation_id"] == "corr-12345"
    assert data["message_type"] == "response"


def test_send_notification_message(client):
    sender_id = str(uuid.uuid4())
    receiver_id = str(uuid.uuid4())
    response = client.post("/api/v1/protocol/messages", json={
        "sender_agent_id": sender_id,
        "receiver_agent_id": receiver_id,
        "message_type": "notification",
        "content": {"event": "task_completed"},
    })
    assert response.status_code == 201
    assert response.json()["message_type"] == "notification"


def test_get_messages(client):
    agent_id = str(uuid.uuid4())
    other_id = str(uuid.uuid4())

    # Send messages to the agent
    client.post("/api/v1/protocol/messages", json={
        "sender_agent_id": other_id,
        "receiver_agent_id": agent_id,
        "message_type": "request",
        "content": {"task": "first"},
    })
    client.post("/api/v1/protocol/messages", json={
        "sender_agent_id": other_id,
        "receiver_agent_id": agent_id,
        "message_type": "request",
        "content": {"task": "second"},
    })

    response = client.get(f"/api/v1/protocol/messages/{agent_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["messages"]) >= 2


def test_get_messages_empty(client):
    agent_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/protocol/messages/{agent_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["messages"] == []
