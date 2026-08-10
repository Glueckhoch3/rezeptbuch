"""Ingredient service layer: business logic between routes and persistence."""

from __future__ import annotations

import uuid

from sqlalchemy.exc import IntegrityError

from ..core.errors import ApiError
from . import repository
from .models import Ingredient


def list_ingredients(q: str | None, page: int, page_size: int):
    from ..core.pagination import paginate

    return paginate(repository.list_query(q), page, page_size)


def get_ingredient(ingredient_id: uuid.UUID) -> Ingredient:
    ingredient = repository.get_by_id(ingredient_id)
    if ingredient is None:
        raise ApiError(f"Ingredient {ingredient_id} was not found.", status_code=404)
    return ingredient


def create_ingredient(data: dict) -> Ingredient:
    ingredient = Ingredient(
        name=data["name"].strip(), description=data.get("description")
    )
    repository.add(ingredient)
    try:
        repository.commit()
    except IntegrityError as exc:
        repository.rollback()
        raise ApiError(
            f"An ingredient named '{ingredient.name}' already exists.",
            status_code=409,
        ) from exc
    return ingredient


def update_ingredient(ingredient_id: uuid.UUID, data: dict) -> Ingredient:
    ingredient = get_ingredient(ingredient_id)
    ingredient.name = data["name"].strip()
    ingredient.description = data.get("description")
    try:
        repository.commit()
    except IntegrityError as exc:
        repository.rollback()
        raise ApiError(
            f"An ingredient named '{ingredient.name}' already exists.",
            status_code=409,
        ) from exc
    return ingredient


def delete_ingredient(ingredient_id: uuid.UUID) -> None:
    ingredient = get_ingredient(ingredient_id)
    if ingredient.recipe_ingredients:
        raise ApiError(
            "Cannot delete an ingredient that is used by a recipe.", status_code=409
        )
    repository.delete(ingredient)
    repository.commit()


def resolve_or_create_by_name(name: str) -> Ingredient:
    """Find a master ingredient row by (case-insensitive) name, or create one."""
    existing = repository.get_by_name(name)
    if existing is not None:
        return existing
    ingredient = Ingredient(name=name.strip())
    repository.add(ingredient)
    repository.commit()
    return ingredient
