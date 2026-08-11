"""Query/persist functions for :class:`Recipe`. No business rules here."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Query

from ..core.extensions import db
from .models import Recipe


def get_by_id(recipe_id: uuid.UUID) -> Recipe | None:
    return db.session.get(Recipe, recipe_id)


def list_query() -> Query:
    return Recipe.query.order_by(Recipe.created_at.desc(), Recipe.id.desc())


def add(recipe: Recipe) -> None:
    db.session.add(recipe)


def delete(recipe: Recipe) -> None:
    db.session.delete(recipe)


def commit() -> None:
    db.session.commit()
