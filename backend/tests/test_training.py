import os
os.environ["TESTING"] = "1"

import uuid


def test_create_training_job(client):
    response = client.post("/api/v1/training/jobs", json={
        "model_name": "my-fine-tuned-model",
        "base_model": "gpt-3.5-turbo",
        "dataset_name": "customer-support-v1",
        "dataset_path": "/data/cs-v1.jsonl",
        "dataset_size": 1000,
        "config": {
            "learning_rate": 2e-5,
            "epochs": 3,
            "batch_size": 8,
            "lora_rank": 16,
        },
    })
    assert response.status_code == 201
    data = response.json()
    assert data["model_name"] == "my-fine-tuned-model"
    assert data["base_model"] == "gpt-3.5-turbo"
    assert data["dataset_name"] == "customer-support-v1"
    assert data["status"] == "queued"
    assert "id" in data


def test_create_training_job_minimal(client):
    response = client.post("/api/v1/training/jobs", json={
        "model_name": "minimal-model",
        "base_model": "llama-2",
        "dataset_name": "test-data",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["model_name"] == "minimal-model"


def test_get_training_job(client):
    create_resp = client.post("/api/v1/training/jobs", json={
        "model_name": "test-model",
        "base_model": "gpt-3.5-turbo",
        "dataset_name": "data-v1",
    })
    job_id = create_resp.json()["id"]
    response = client.get(f"/api/v1/training/jobs/{job_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == job_id
    assert data["model_name"] == "test-model"


def test_get_training_job_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/training/jobs/{fake_id}")
    assert response.status_code == 404


def test_list_training_jobs(client):
    client.post("/api/v1/training/jobs", json={
        "model_name": "model-a",
        "base_model": "gpt-3.5-turbo",
        "dataset_name": "data-a",
    })
    client.post("/api/v1/training/jobs", json={
        "model_name": "model-b",
        "base_model": "llama-2",
        "dataset_name": "data-b",
    })
    response = client.get("/api/v1/training/jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["jobs"]) >= 2


def test_list_training_jobs_empty(client):
    response = client.get("/api/v1/training/jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["jobs"] == []


def test_list_models_empty(client):
    response = client.get("/api/v1/training/models")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["models"] == []


def test_list_models(client):
    response = client.get("/api/v1/training/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "total" in data


def test_start_training(client):
    create_resp = client.post("/api/v1/training/jobs", json={
        "model_name": "start-test",
        "base_model": "gpt-3.5-turbo",
        "dataset_name": "data-x",
    })
    job_id = create_resp.json()["id"]
    response = client.post(f"/api/v1/training/jobs/{job_id}/start")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("training", "pending", "completed")


def test_start_training_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.post(f"/api/v1/training/jobs/{fake_id}/start")
    assert response.status_code == 404


def test_list_jobs_pagination(client):
    for i in range(3):
        client.post("/api/v1/training/jobs", json={
            "model_name": f"model-{i}",
            "base_model": "gpt-3.5-turbo",
            "dataset_name": f"data-{i}",
        })
    response = client.get("/api/v1/training/jobs?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["jobs"]) <= 2
