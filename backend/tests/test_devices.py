import os
os.environ["TESTING"] = "1"

import uuid


def _user_id():
    return str(uuid.uuid4())


def _register_device(client, name="Test Robot", device_type="robot"):
    return client.post("/api/v1/devices/register", json={
        "name": name,
        "device_type": device_type,
        "owner_id": _user_id(),
        "capabilities": ["move", "see"],
        "location_lat": 37.7749,
        "location_lng": -122.4194,
    })


def test_register_device(client):
    response = _register_device(client)
    assert response.status_code == 201
    data = response.json()
    assert "device" in data
    assert "api_key" in data
    assert data["device"]["name"] == "Test Robot"
    assert data["device"]["device_type"] == "robot"
    assert data["device"]["status"] == "offline"
    assert data["api_key"].startswith("dev_")


def test_register_device_drone(client):
    response = _register_device(client, name="Test Drone", device_type="drone")
    assert response.status_code == 201
    assert response.json()["device"]["device_type"] == "drone"


def test_list_devices(client):
    _register_device(client, name="Device A")
    _register_device(client, name="Device B")
    response = client.get("/api/v1/devices/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2


def test_list_devices_empty(client):
    response = client.get("/api/v1/devices/")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_get_device(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.get(f"/api/v1/devices/{device_id}")
    assert response.status_code == 200
    assert response.json()["id"] == device_id


def test_get_device_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/devices/{fake_id}")
    assert response.status_code == 404


def test_update_device(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.put(f"/api/v1/devices/{device_id}", json={
        "name": "Updated Robot",
        "capabilities": ["move", "see", "speak"],
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Robot"


def test_update_device_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.put(f"/api/v1/devices/{fake_id}", json={"name": "X"})
    assert response.status_code == 404


def test_deregister_device(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.delete(f"/api/v1/devices/{device_id}")
    assert response.status_code == 200
    # Verify it's gone
    get_resp = client.get(f"/api/v1/devices/{device_id}")
    assert get_resp.status_code == 404


def test_update_device_status(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.put(f"/api/v1/devices/{device_id}/status?status=online")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_get_capabilities(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.get(f"/api/v1/devices/{device_id}/capabilities")
    assert response.status_code == 200
    assert "capabilities" in response.json()
    assert "move" in response.json()["capabilities"]


def test_send_command(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.post(f"/api/v1/devices/{device_id}/command", json={
        "command_type": "movement",
        "payload": {"direction": "forward", "distance": 1.0},
        "issued_by": _user_id(),
    })
    assert response.status_code == 201
    data = response.json()
    assert data["command_type"] == "movement"
    assert data["status"] == "queued"


def test_send_command_device_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.post(f"/api/v1/devices/{fake_id}/command", json={
        "command_type": "movement",
        "payload": {},
        "issued_by": _user_id(),
    })
    assert response.status_code == 404


def test_list_commands(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    client.post(f"/api/v1/devices/{device_id}/command", json={
        "command_type": "sensor_read",
        "payload": {},
        "issued_by": _user_id(),
    })
    response = client.get(f"/api/v1/devices/{device_id}/commands")
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_get_twin(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.get(f"/api/v1/devices/{device_id}/twin")
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == device_id


def test_get_twin_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/devices/{fake_id}/twin")
    assert response.status_code == 404


def test_simulate_twin_action(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.post(f"/api/v1/devices/{device_id}/twin/simulate", json={
        "action": "move_forward",
        "parameters": {"distance": 1.5},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "move_forward"
    assert data["safe"] == True


def test_get_twin_history(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    response = client.get(f"/api/v1/devices/{device_id}/twin/history")
    assert response.status_code == 200
    assert "history" in response.json()


def test_create_listing(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    owner_id = reg.json()["device"]["owner_id"]
    response = client.post("/api/v1/devices/marketplace/list", json={
        "device_id": device_id,
        "owner_id": owner_id,
        "description": "Robot for hire",
        "price_per_command": 5.0,
    })
    assert response.status_code == 201
    assert response.json()["description"] == "Robot for hire"


def test_browse_marketplace(client):
    reg = _register_device(client)
    device_id = reg.json()["device"]["id"]
    owner_id = reg.json()["device"]["owner_id"]
    client.post("/api/v1/devices/marketplace/list", json={
        "device_id": device_id,
        "owner_id": owner_id,
        "description": "Robot for hire",
        "price_per_command": 5.0,
    })
    response = client.get("/api/v1/devices/marketplace")
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_deploy_edge_model(client):
    reg = _register_device(client, device_type="edge")
    device_id = reg.json()["device"]["id"]
    response = client.post("/api/v1/devices/edge/deploy", json={
        "device_id": device_id,
        "model_name": "yolov8-nano",
        "model_version": "1.0.0",
        "quantization": "INT8",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["model_name"] == "yolov8-nano"
    assert data["quantization"] == "INT8"
    assert data["status"] == "deploying"


def test_list_edge_deployments(client):
    reg = _register_device(client, device_type="edge")
    device_id = reg.json()["device"]["id"]
    client.post("/api/v1/devices/edge/deploy", json={
        "device_id": device_id,
        "model_name": "clip-model",
        "model_version": "2.0.0",
        "quantization": "FP16",
    })
    response = client.get(f"/api/v1/devices/{device_id}/edge/deployments")
    assert response.status_code == 200
    assert len(response.json()["deployments"]) >= 1
