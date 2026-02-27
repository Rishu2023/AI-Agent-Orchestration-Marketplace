import os
os.environ["TESTING"] = "1"

import uuid


def _admin_id():
    return str(uuid.uuid4())


def test_list_users(client):
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert "users" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


def test_list_users_pagination(client):
    response = client.get("/api/v1/admin/users?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 5


def test_create_announcement(client):
    admin_id = _admin_id()
    response = client.post("/api/v1/admin/announcements", json={
        "title": "System Maintenance",
        "content": "The platform will undergo maintenance from 2-4 AM UTC.",
        "announcement_type": "warning",
        "admin_id": admin_id,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "System Maintenance"
    assert data["announcement_type"] == "warning"
    assert data["is_active"] is True
    assert "id" in data


def test_create_announcement_info(client):
    response = client.post("/api/v1/admin/announcements", json={
        "title": "New Feature Release",
        "content": "We've added support for Claude 3.",
        "announcement_type": "info",
        "admin_id": _admin_id(),
    })
    assert response.status_code == 201
    assert response.json()["announcement_type"] == "info"


def test_create_announcement_critical(client):
    response = client.post("/api/v1/admin/announcements", json={
        "title": "Critical Security Update",
        "content": "All users must rotate API keys.",
        "announcement_type": "critical",
        "admin_id": _admin_id(),
    })
    assert response.status_code == 201
    assert response.json()["announcement_type"] == "critical"


def test_list_announcements(client):
    admin_id = _admin_id()
    client.post("/api/v1/admin/announcements", json={
        "title": "Announcement 1",
        "content": "First announcement.",
        "announcement_type": "info",
        "admin_id": admin_id,
    })
    client.post("/api/v1/admin/announcements", json={
        "title": "Announcement 2",
        "content": "Second announcement.",
        "announcement_type": "warning",
        "admin_id": admin_id,
    })
    response = client.get("/api/v1/admin/announcements")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_list_announcements_empty(client):
    response = client.get("/api/v1/admin/announcements")
    assert response.status_code == 200
    assert response.json() == []


def test_activate_kill_switch(client):
    admin_id = _admin_id()
    response = client.post("/api/v1/admin/kill-switch", json={
        "target_type": "agent",
        "target_id": str(uuid.uuid4()),
        "reason": "Agent producing harmful output",
        "admin_id": admin_id,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["target_type"] == "agent"
    assert data["reason"] == "Agent producing harmful output"
    assert data["is_active"] is True
    assert "id" in data


def test_activate_kill_switch_global(client):
    response = client.post("/api/v1/admin/kill-switch", json={
        "target_type": "global",
        "reason": "Emergency shutdown",
        "admin_id": _admin_id(),
    })
    assert response.status_code == 201
    data = response.json()
    assert data["target_type"] == "global"


def test_deactivate_kill_switch(client):
    admin_id = _admin_id()
    create_resp = client.post("/api/v1/admin/kill-switch", json={
        "target_type": "workflow",
        "target_id": str(uuid.uuid4()),
        "reason": "Testing kill switch",
        "admin_id": admin_id,
    })
    switch_id = create_resp.json()["id"]
    response = client.delete(f"/api/v1/admin/kill-switch/{switch_id}?admin_id={admin_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False


def test_deactivate_kill_switch_not_found(client):
    fake_id = str(uuid.uuid4())
    admin_id = _admin_id()
    response = client.delete(f"/api/v1/admin/kill-switch/{fake_id}?admin_id={admin_id}")
    assert response.status_code == 404


def test_get_audit_log(client):
    response = client.get("/api/v1/admin/audit-log")
    assert response.status_code == 200
    data = response.json()
    assert "logs" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


def test_get_audit_log_pagination(client):
    response = client.get("/api/v1/admin/audit-log?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
