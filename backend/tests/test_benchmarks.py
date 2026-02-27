import os
os.environ["TESTING"] = "1"


def test_run_benchmark(client):
    response = client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["model_provider"] == "openai"
    assert data["model_name"] == "gpt-4"
    assert "overall_score" in data
    assert "reasoning_score" in data
    assert "creativity_score" in data
    assert "code_generation_score" in data
    assert "id" in data


def test_run_benchmark_different_model(client):
    response = client.post("/api/v1/benchmarks/run", json={
        "model_provider": "anthropic",
        "model_name": "claude-3",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["model_provider"] == "anthropic"
    assert data["model_name"] == "claude-3"


def test_leaderboard_empty(client):
    response = client.get("/api/v1/benchmarks/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data


def test_leaderboard_with_data(client):
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "anthropic",
        "model_name": "claude-3",
    })
    response = client.get("/api/v1/benchmarks/leaderboard?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) >= 2


def test_compare_models(client):
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "anthropic",
        "model_name": "claude-3",
    })
    response = client.get("/api/v1/benchmarks/compare?models=gpt-4,claude-3")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data


def test_benchmark_history(client):
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    response = client.get("/api/v1/benchmarks/history/gpt-4")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "gpt-4"
    assert "history" in data
    assert len(data["history"]) >= 2


def test_benchmark_scores_range(client):
    response = client.post("/api/v1/benchmarks/run", json={
        "model_provider": "openai",
        "model_name": "gpt-4",
    })
    data = response.json()
    for score_field in [
        "reasoning_score", "creativity_score", "code_generation_score",
        "instruction_following_score", "multi_step_planning_score",
        "self_correction_score", "tool_use_score", "memory_retrieval_score",
        "overall_score",
    ]:
        assert 0.0 <= data[score_field] <= 100.0, f"{score_field} out of range"
