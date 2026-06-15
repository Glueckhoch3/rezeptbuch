"""Recipe service layer: business logic between routes and persistence.

Routes stay thin by delegating create/read/update/delete work here. This is
also where ordered instructions and ingredient positions are normalized.
"""

from __future__ import annotations

from .errors import ApiError
from .extensions import db
from .models import Ingredient, Instruction, Recipe


def list_recipes() -> list[Recipe]:
    """Return all recipes, newest first."""
    return Recipe.query.order_by(Recipe.created_at.desc()).all()


def get_recipe(recipe_id: int) -> Recipe:
    """Return a recipe by id or raise a 404 :class:`ApiError`."""
    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None:
        raise ApiError(f"Recipe {recipe_id} was not found.", status_code=404)
    return recipe


def create_recipe(data: dict) -> Recipe:
    """Create and persist a recipe from already-validated data."""
    recipe = Recipe(
        title=data["title"].strip(), description=data.get("description", "")
    )
    _apply_children(recipe, data)
    db.session.add(recipe)
    db.session.commit()
    return recipe


def update_recipe(recipe_id: int, data: dict) -> Recipe:
    """Replace a recipe's fields and child collections with validated data."""
    recipe = get_recipe(recipe_id)
    recipe.title = data["title"].strip()
    recipe.description = data.get("description", "")
    # Replacing collections wholesale keeps update semantics simple and
    # predictable; cascade delete-orphan removes the previous children.
    recipe.ingredients.clear()
    recipe.instructions.clear()
    _apply_children(recipe, data)
    db.session.commit()
    return recipe


def delete_recipe(recipe_id: int) -> None:
    """Delete a recipe and its children."""
    recipe = get_recipe(recipe_id)
    db.session.delete(recipe)
    db.session.commit()


def _apply_children(recipe: Recipe, data: dict) -> None:
    """Attach ordered ingredients and instructions to a recipe."""
    for position, raw in enumerate(data.get("ingredients", [])):
        recipe.ingredients.append(
            Ingredient(
                position=position,
                amount=(raw.get("amount") or "").strip(),
                unit=(raw.get("unit") or "").strip(),
                name=raw["name"].strip(),
            )
        )
    for index, raw in enumerate(data.get("instructions", []), start=1):
        recipe.instructions.append(
            Instruction(step_number=index, text=raw["text"].strip())
        )
