"""Integration tests for the recipe CRUD API and database behavior."""

from __future__ import annotations


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json() == {"status": "ok"}


def test_list_is_empty_initially(client):
    resp = client.get("/api/recipes")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_create_and_get_recipe(client, sample_payload):
    resp = client.post("/api/recipes", json=sample_payload)
    assert resp.status_code == 201
    created = resp.get_json()
    assert created["id"] > 0
    assert created["title"] == "Test Soup"
    # Ingredients keep their order via position.
    assert [i["name"] for i in created["ingredients"]] == [
        "Vegetable stock",
        "Carrots",
    ]
    # Instructions are numbered in order.
    assert [s["step_number"] for s in created["instructions"]] == [1, 2]

    fetched = client.get(f"/api/recipes/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.get_json()["title"] == "Test Soup"


def test_update_recipe(client, sample_payload):
    created = client.post("/api/recipes", json=sample_payload).get_json()
    sample_payload["title"] = "Updated Soup"
    sample_payload["instructions"] = [{"text": "Only one step now."}]
    resp = client.put(f"/api/recipes/{created['id']}", json=sample_payload)
    assert resp.status_code == 200
    updated = resp.get_json()
    assert updated["title"] == "Updated Soup"
    assert len(updated["instructions"]) == 1


def test_delete_recipe(client, sample_payload):
    created = client.post("/api/recipes", json=sample_payload).get_json()
    resp = client.delete(f"/api/recipes/{created['id']}")
    assert resp.status_code == 204
    assert client.get(f"/api/recipes/{created['id']}").status_code == 404


def test_get_missing_recipe_returns_404(client):
    resp = client.get("/api/recipes/999")
    assert resp.status_code == 404
    assert "error" in resp.get_json()


def test_create_invalid_recipe_returns_422(client):
    resp = client.post("/api/recipes", json={"title": ""})
    assert resp.status_code == 422
    body = resp.get_json()
    assert body["error"] == "Validation failed."
    assert "title" in body["details"]


def test_non_json_body_returns_415(client):
    resp = client.post("/api/recipes", data="not json", content_type="text/plain")
    assert resp.status_code == 415
