"""Integration tests for the allergen master-data API."""

from __future__ import annotations


def test_create_and_list_allergen(client):
    resp = client.post("/api/allergens", json={"name": "gluten"})
    assert resp.status_code == 201

    listed = client.get("/api/allergens").get_json()
    assert listed["total"] == 1
    assert listed["items"][0]["name"] == "gluten"


def test_duplicate_name_returns_409(client):
    client.post("/api/allergens", json={"name": "gluten"})
    resp = client.post("/api/allergens", json={"name": "Gluten"})
    assert resp.status_code == 409


def test_delete_allergen(client):
    created = client.post("/api/allergens", json={"name": "gluten"}).get_json()
    resp = client.delete(f"/api/allergens/{created['id']}")
    assert resp.status_code == 204
