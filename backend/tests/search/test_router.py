"""Integration tests for GET /api/recipes/search."""

from __future__ import annotations

from app.allergen.models import Allergen, IngredientAllergen
from app.core.extensions import db


def _create_recipe(client, title, tags, ingredient_names, description="A recipe."):
    payload = {
        "title": title,
        "description": description,
        "tags": tags,
        "ingredients": [
            {"name": name, "amount": "1", "unit": ""} for name in ingredient_names
        ],
        "worksteps": [{"title": "Do it", "description": "Do the thing."}],
    }
    return client.post("/api/recipes", json=payload).get_json()


def test_search_by_tag(client):
    _create_recipe(client, "Pancakes", ["breakfast"], ["Flour"])
    _create_recipe(client, "Steak", ["dinner"], ["Beef"])

    resp = client.get("/api/recipes/search?tag=breakfast")
    body = resp.get_json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Pancakes"


def test_search_by_ingredient(client):
    _create_recipe(client, "Pancakes", ["breakfast"], ["Flour"])
    _create_recipe(client, "Steak", ["dinner"], ["Beef"])

    resp = client.get("/api/recipes/search?ingredient=Beef")
    body = resp.get_json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Steak"


def test_search_by_text(client):
    _create_recipe(
        client, "Pancakes", [], ["Flour"], description="Fluffy breakfast treat."
    )
    _create_recipe(client, "Steak", [], ["Beef"], description="A hearty dinner.")

    resp = client.get("/api/recipes/search?q=fluffy")
    body = resp.get_json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Pancakes"


def test_search_combines_filters_with_and(client):
    _create_recipe(client, "Pancakes", ["breakfast"], ["Flour"])
    _create_recipe(client, "Waffles", ["breakfast"], ["Sugar"])

    resp = client.get("/api/recipes/search?tag=breakfast&ingredient=Flour")
    body = resp.get_json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Pancakes"


def test_search_by_allergen(app, client):
    recipe = _create_recipe(client, "Pancakes", [], ["Flour"])
    ingredient_id = recipe["ingredients"][0]["ingredient_id"]

    with app.app_context():
        allergen = Allergen(name="gluten")
        db.session.add(allergen)
        db.session.flush()
        db.session.add(
            IngredientAllergen(ingredient_id=ingredient_id, allergen_id=allergen.id)
        )
        db.session.commit()

    resp = client.get("/api/recipes/search?allergen=gluten")
    body = resp.get_json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "Pancakes"
