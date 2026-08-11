"""Integration tests for the recipe CRUD API."""

from __future__ import annotations


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json() == {"status": "ok"}


def test_list_is_empty_initially(client):
    resp = client.get("/api/recipes")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body == {"items": [], "page": 1, "page_size": 20, "total": 0}


def test_create_and_get_recipe(client, sample_payload):
    resp = client.post("/api/recipes", json=sample_payload)
    assert resp.status_code == 201
    created = resp.get_json()
    assert created["title"] == "Test Soup"
    assert created["origin"] == "Testland"
    assert [i["name"] for i in created["ingredients"]] == [
        "Vegetable stock",
        "Carrots",
    ]
    assert [w["step_number"] for w in created["worksteps"]] == [1, 2]
    assert sorted(t["name"] for t in created["tags"]) == ["soup", "warming"]

    fetched = client.get(f"/api/recipes/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.get_json()["title"] == "Test Soup"


def test_create_reuses_existing_ingredient_by_id(client, sample_payload):
    first = client.post("/api/recipes", json=sample_payload).get_json()
    reused_id = first["ingredients"][0]["ingredient_id"]

    second_payload = {
        "title": "Second Soup",
        "ingredients": [{"ingredient_id": reused_id, "amount": "2", "unit": "l"}],
        "worksteps": [{"title": "Cook", "description": "Cook it."}],
    }
    resp = client.post("/api/recipes", json=second_payload)
    assert resp.status_code == 201
    created = resp.get_json()
    assert created["ingredients"][0]["ingredient_id"] == reused_id
    assert created["ingredients"][0]["name"] == "Vegetable stock"

    ingredients = client.get("/api/ingredients").get_json()
    assert ingredients["total"] == 2


def test_patch_updates_only_title(client, sample_payload):
    created = client.post("/api/recipes", json=sample_payload).get_json()
    resp = client.patch(f"/api/recipes/{created['id']}", json={"title": "New Title"})
    assert resp.status_code == 200
    updated = resp.get_json()
    assert updated["title"] == "New Title"
    # Untouched fields stay as they were.
    assert len(updated["ingredients"]) == 2
    assert len(updated["worksteps"]) == 2


def test_patch_replaces_worksteps_wholesale(client, sample_payload):
    created = client.post("/api/recipes", json=sample_payload).get_json()
    resp = client.patch(
        f"/api/recipes/{created['id']}",
        json={"worksteps": [{"title": "Only step", "description": "Do it all."}]},
    )
    assert resp.status_code == 200
    updated = resp.get_json()
    assert len(updated["worksteps"]) == 1
    assert updated["title"] == "Test Soup"


def test_delete_recipe(client, sample_payload):
    created = client.post("/api/recipes", json=sample_payload).get_json()
    resp = client.delete(f"/api/recipes/{created['id']}")
    assert resp.status_code == 204
    assert client.get(f"/api/recipes/{created['id']}").status_code == 404


def test_get_missing_recipe_returns_404(client):
    resp = client.get("/api/recipes/00000000-0000-0000-0000-000000000000")
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


def test_list_pagination(client, sample_payload):
    for i in range(3):
        payload = dict(sample_payload, title=f"Soup {i}")
        client.post("/api/recipes", json=payload)

    resp = client.get("/api/recipes?page=1&page_size=2")
    body = resp.get_json()
    assert body["page"] == 1
    assert body["page_size"] == 2
    assert body["total"] == 3
    assert len(body["items"]) == 2
