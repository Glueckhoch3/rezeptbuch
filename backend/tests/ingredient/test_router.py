"""Integration tests for the ingredient master-data API."""

from __future__ import annotations


def test_create_and_get_ingredient(client):
    resp = client.post(
        "/api/ingredients", json={"name": "Flour", "description": "Wheat flour"}
    )
    assert resp.status_code == 201
    created = resp.get_json()
    assert created["name"] == "Flour"

    fetched = client.get(f"/api/ingredients/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.get_json()["name"] == "Flour"


def test_duplicate_name_returns_409(client):
    client.post("/api/ingredients", json={"name": "Flour"})
    resp = client.post("/api/ingredients", json={"name": "flour"})
    assert resp.status_code == 409


def test_update_ingredient(client):
    created = client.post("/api/ingredients", json={"name": "Flour"}).get_json()
    resp = client.put(f"/api/ingredients/{created['id']}", json={"name": "Wheat flour"})
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "Wheat flour"


def test_delete_unused_ingredient(client):
    created = client.post("/api/ingredients", json={"name": "Flour"}).get_json()
    resp = client.delete(f"/api/ingredients/{created['id']}")
    assert resp.status_code == 204


def test_delete_ingredient_used_by_recipe_returns_409(client, sample_payload):
    recipe = client.post("/api/recipes", json=sample_payload).get_json()
    ingredient_id = recipe["ingredients"][0]["ingredient_id"]
    resp = client.delete(f"/api/ingredients/{ingredient_id}")
    assert resp.status_code == 409


def test_list_supports_q_prefix_search(client):
    client.post("/api/ingredients", json={"name": "Flour"})
    client.post("/api/ingredients", json={"name": "Fish"})
    client.post("/api/ingredients", json={"name": "Sugar"})

    resp = client.get("/api/ingredients?q=fl")
    body = resp.get_json()
    assert [i["name"] for i in body["items"]] == ["Flour"]


def test_get_missing_ingredient_returns_404(client):
    resp = client.get("/api/ingredients/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_set_and_replace_ingredient_allergens(client):
    created = client.post("/api/ingredients", json={"name": "Flour"}).get_json()

    resp = client.put(
        f"/api/ingredients/{created['id']}/allergens",
        json={"allergens": ["gluten", "Gluten", "wheat"]},
    )
    assert resp.status_code == 200
    names = sorted(a["name"] for a in resp.get_json()["allergens"])
    assert names == ["gluten", "wheat"]

    replaced = client.put(
        f"/api/ingredients/{created['id']}/allergens",
        json={"allergens": ["soy"]},
    )
    assert [a["name"] for a in replaced.get_json()["allergens"]] == ["soy"]


def test_recipe_ingredient_output_includes_allergens(client, sample_payload):
    ingredient = client.post("/api/ingredients", json={"name": "Vegetable stock"})
    ingredient_id = ingredient.get_json()["id"]
    client.put(
        f"/api/ingredients/{ingredient_id}/allergens", json={"allergens": ["celery"]}
    )

    payload = dict(sample_payload)
    payload["ingredients"] = [
        {"ingredient_id": ingredient_id, "amount": "1", "unit": "l"},
        {"amount": "2", "unit": "", "name": "Carrots"},
    ]
    recipe = client.post("/api/recipes", json=payload).get_json()

    stock_line = next(
        i for i in recipe["ingredients"] if i["ingredient_id"] == ingredient_id
    )
    assert [a["name"] for a in stock_line["allergens"]] == ["celery"]

    carrot_line = next(
        i for i in recipe["ingredients"] if i["ingredient_id"] != ingredient_id
    )
    assert carrot_line["allergens"] == []
