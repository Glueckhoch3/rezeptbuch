"""Recipe service layer: business logic between routes and persistence.

Orchestrates worksteps, ingredients, and tags. Updates replace the
ingredient/workstep/tag collections wholesale rather than diffing them.
"""

from __future__ import annotations

import uuid

from ..core.errors import ApiError
from ..ingredient import service as ingredient_service
from ..recipe_ingredient.models import RecipeIngredient
from ..tag import service as tag_service
from ..workstep.models import Workstep
from . import repository
from .models import Recipe


def list_recipes(page: int, page_size: int):
    from ..core.pagination import paginate

    return paginate(repository.list_query(), page, page_size)


def get_recipe(recipe_id: uuid.UUID) -> Recipe:
    recipe = repository.get_by_id(recipe_id)
    if recipe is None:
        raise ApiError(f"Recipe {recipe_id} was not found.", status_code=404)
    return recipe


def create_recipe(data: dict) -> Recipe:
    recipe = Recipe(
        title=data["title"].strip(),
        description=data.get("description", ""),
        origin=(data.get("origin") or None),
    )
    repository.add(recipe)
    _apply_worksteps(recipe, data["worksteps"])
    _apply_ingredients(recipe, data["ingredients"])
    _apply_tags(recipe, data["tags"])
    repository.commit()
    return recipe


def update_recipe(recipe_id: uuid.UUID, data: dict) -> Recipe:
    """Apply a partial update: only fields present in ``data`` are changed."""
    recipe = get_recipe(recipe_id)

    if "title" in data:
        recipe.title = data["title"].strip()
    if "description" in data:
        recipe.description = data["description"]
    if "origin" in data:
        recipe.origin = data["origin"] or None
    if "worksteps" in data:
        recipe.worksteps.clear()
        _apply_worksteps(recipe, data["worksteps"])
    if "ingredients" in data:
        recipe.recipe_ingredients.clear()
        _apply_ingredients(recipe, data["ingredients"])
    if "tags" in data:
        recipe.recipe_tags.clear()
        _apply_tags(recipe, data["tags"])

    repository.commit()
    return recipe


def delete_recipe(recipe_id: uuid.UUID) -> None:
    recipe = get_recipe(recipe_id)
    repository.delete(recipe)
    repository.commit()


def _apply_worksteps(recipe: Recipe, worksteps: list[dict]) -> None:
    for index, raw in enumerate(worksteps, start=1):
        recipe.worksteps.append(
            Workstep(
                step_number=index,
                title=raw["title"].strip(),
                description=raw["description"].strip(),
            )
        )


def _apply_ingredients(recipe: Recipe, ingredients: list[dict]) -> None:
    for position, raw in enumerate(ingredients):
        if raw.get("ingredient_id"):
            ingredient = ingredient_service.get_ingredient(raw["ingredient_id"])
        else:
            ingredient = ingredient_service.resolve_or_create_by_name(raw["name"])
        recipe.recipe_ingredients.append(
            RecipeIngredient(
                ingredient=ingredient,
                amount=(raw.get("amount") or "").strip(),
                unit=(raw.get("unit") or "").strip(),
                position=position,
            )
        )


def _apply_tags(recipe: Recipe, tag_names: list[str]) -> None:
    from ..tag.models import RecipeTag

    for name in tag_names:
        tag = tag_service.resolve_or_create_by_name(name)
        recipe.recipe_tags.append(RecipeTag(tag=tag))
