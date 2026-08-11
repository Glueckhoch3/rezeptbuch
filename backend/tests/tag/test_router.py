"""Integration tests for the tag master-data API."""

from __future__ import annotations


def test_create_and_list_tag(client):
    resp = client.post("/api/tags", json={"name": "breakfast"})
    assert resp.status_code == 201

    listed = client.get("/api/tags").get_json()
    assert listed["total"] == 1
    assert listed["items"][0]["name"] == "breakfast"


def test_duplicate_name_returns_409(client):
    client.post("/api/tags", json={"name": "breakfast"})
    resp = client.post("/api/tags", json={"name": "Breakfast"})
    assert resp.status_code == 409


def test_delete_tag(client):
    created = client.post("/api/tags", json={"name": "breakfast"}).get_json()
    resp = client.delete(f"/api/tags/{created['id']}")
    assert resp.status_code == 204


def test_list_supports_q_prefix_search(client):
    client.post("/api/tags", json={"name": "breakfast"})
    client.post("/api/tags", json={"name": "brunch"})
    client.post("/api/tags", json={"name": "dinner"})

    resp = client.get("/api/tags?q=br")
    body = resp.get_json()
    assert sorted(t["name"] for t in body["items"]) == ["breakfast", "brunch"]
