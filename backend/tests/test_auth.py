import pytest


def test_register_user(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data


def test_register_duplicate_email(client):
    user_data = {
        "email": "duplicate@example.com",
        "username": "user1",
        "password": "testpassword123",
    }
    client.post("/api/v1/auth/register", json=user_data)

    user_data["username"] = "user2"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400


def test_register_duplicate_username(client):
    client.post("/api/v1/auth/register", json={
        "email": "user1@example.com",
        "username": "sameusername",
        "password": "testpassword123",
    })
    response = client.post("/api/v1/auth/register", json={
        "email": "user2@example.com",
        "username": "sameusername",
        "password": "testpassword123",
    })
    assert response.status_code == 400


def test_login(client):
    # Register first
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "testpassword123",
    })

    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "testpassword123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
