"""Query/persist functions for :class:`Ingredient`. No business rules here."""

from __future__ import annotations

import uuid

from sqlalchemy import func
from sqlalchemy.orm import Query

from ..core.extensions import db
from .models import Ingredient


def get_by_id(ingredient_id: uuid.UUID) -> Ingredient | None:
    return db.session.get(Ingredient, ingredient_id)


def get_by_name(name: str) -> Ingredient | None:
    return Ingredient.query.filter(func.lower(Ingredient.name) == name.lower()).first()


def list_query(q: str | None = None) -> Query:
    query = Ingredient.query.order_by(Ingredient.name)
    if q:
        query = query.filter(Ingredient.name.ilike(f"{q}%"))
    return query


def add(ingredient: Ingredient) -> None:
    db.session.add(ingredient)


def delete(ingredient: Ingredient) -> None:
    db.session.delete(ingredient)


def commit() -> None:
    db.session.commit()


def rollback() -> None:
    db.session.rollback()
