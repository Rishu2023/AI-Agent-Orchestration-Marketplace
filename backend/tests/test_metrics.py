import os
os.environ["TESTING"] = "1"


def test_get_metrics(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    text = response.text
    assert "total_requests" in text
    assert "active_requests" in text
    assert "request_latency_seconds" in text
    assert "db_connections_active" in text


def test_metrics_format(client):
    response = client.get("/metrics")
    text = response.text
    lines = text.strip().split("\n")
    # Should have HELP and TYPE comments plus values
    assert any(line.startswith("# HELP") for line in lines)
    assert any(line.startswith("# TYPE") for line in lines)


def test_metrics_counter_values(client):
    response = client.get("/metrics")
    text = response.text
    # Verify Prometheus exposition format: metric_name value
    for line in text.strip().split("\n"):
        if line.startswith("#") or line.strip() == "":
            continue
        parts = line.split()
        assert len(parts) == 2, f"Unexpected metric line format: {line}"
        # Value should be numeric
        float(parts[1])
