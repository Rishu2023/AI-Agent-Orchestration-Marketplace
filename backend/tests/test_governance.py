import os
os.environ["TESTING"] = "1"

import uuid


def _user_id():
    return str(uuid.uuid4())


def _create_proposal(client, title="Test Proposal", proposal_type="feature_request"):
    return client.post("/api/v1/governance/proposals", json={
        "title": title,
        "description": "A detailed description of the proposal.",
        "proposal_type": proposal_type,
        "proposed_by": _user_id(),
    })


def test_create_proposal(client):
    response = _create_proposal(client)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Proposal"
    assert data["proposal_type"] == "feature_request"
    assert data["status"] == "active"
    assert data["votes_for"] == 0
    assert data["votes_against"] == 0
    assert "id" in data


def test_create_proposal_rule_change(client):
    response = _create_proposal(client, title="Rule Change", proposal_type="rule_change")
    assert response.status_code == 201
    assert response.json()["proposal_type"] == "rule_change"


def test_list_proposals(client):
    _create_proposal(client, title="Proposal A")
    _create_proposal(client, title="Proposal B")
    response = client.get("/api/v1/governance/proposals")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["proposals"]) >= 2


def test_list_proposals_empty(client):
    response = client.get("/api/v1/governance/proposals")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["proposals"] == []


def test_get_proposal(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]
    response = client.get(f"/api/v1/governance/proposals/{proposal_id}")
    assert response.status_code == 200
    assert response.json()["id"] == proposal_id


def test_get_proposal_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/governance/proposals/{fake_id}")
    assert response.status_code == 404


def test_cast_vote(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]
    voter_id = _user_id()
    response = client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": voter_id,
        "vote_type": "for",
        "weight": 1.0,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["proposal_id"] == proposal_id
    assert data["user_id"] == voter_id
    assert data["vote_type"] == "for"


def test_cast_vote_against(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]
    response = client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": _user_id(),
        "vote_type": "against",
        "weight": 1.0,
    })
    assert response.status_code == 201
    assert response.json()["vote_type"] == "against"


def test_duplicate_vote_fails(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]
    voter_id = _user_id()
    # First vote
    client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": voter_id,
        "vote_type": "for",
        "weight": 1.0,
    })
    # Second vote by same user
    response = client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": voter_id,
        "vote_type": "against",
        "weight": 1.0,
    })
    assert response.status_code == 400


def test_get_results(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]

    # Cast some votes
    client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": _user_id(),
        "vote_type": "for",
        "weight": 1.0,
    })
    client.post(f"/api/v1/governance/proposals/{proposal_id}/vote", json={
        "user_id": _user_id(),
        "vote_type": "against",
        "weight": 1.0,
    })

    response = client.get(f"/api/v1/governance/proposals/{proposal_id}/results")
    assert response.status_code == 200
    data = response.json()
    assert data["proposal_id"] == proposal_id
    assert "votes_for" in data
    assert "votes_against" in data
    assert "total_votes" in data
    assert data["total_votes"] >= 2


def test_get_results_not_found(client):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/governance/proposals/{fake_id}/results")
    assert response.status_code == 404


def test_veto_proposal(client):
    create_resp = _create_proposal(client)
    proposal_id = create_resp.json()["id"]
    response = client.post(f"/api/v1/governance/proposals/{proposal_id}/veto")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "vetoed"
