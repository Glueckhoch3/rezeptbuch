"""Unit tests for recipe.service business logic."""

from __future__ import annotations

import pytest

from app.core.errors import ApiError
from app.ingredient.models import Ingredient
from app.recipe import service


def test_create_recipe_resolves_ingredient_by_name(app, sample_payload):
    with app.app_context():
        recipe = service.create_recipe(sample_payload)
        names = {ri.ingredient.name for ri in recipe.recipe_ingredients}
        assert names == {"Vegetable stock", "Carrots"}
        assert Ingredient.query.count() == 2


def test_create_recipe_reuses_ingredient_by_name_case_insensitive(app, sample_payload):
    with app.app_context():
        service.create_recipe(sample_payload)
        second_payload = dict(sample_payload, title="Second Soup")
        second_payload["ingredients"] = [
            {"name": "vegetable stock", "amount": "1", "unit": "l"}
        ]
        service.create_recipe(second_payload)
        assert Ingredient.query.count() == 2


def test_create_recipe_with_unknown_ingredient_id_raises(app, sample_payload):
    with app.app_context():
        sample_payload["ingredients"] = [
            {
                "ingredient_id": "00000000-0000-0000-0000-000000000000",
                "amount": "1",
                "unit": "l",
            }
        ]
        with pytest.raises(ApiError):
            service.create_recipe(sample_payload)


def test_update_recipe_leaves_untouched_fields(app, sample_payload):
    with app.app_context():
        recipe = service.create_recipe(sample_payload)
        service.update_recipe(recipe.id, {"title": "Renamed"})
        refreshed = service.get_recipe(recipe.id)
        assert refreshed.title == "Renamed"
        assert len(refreshed.recipe_ingredients) == 2
        assert len(refreshed.worksteps) == 2
