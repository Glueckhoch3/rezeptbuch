"""Query/persist functions for :class:`Allergen`. No business rules here."""

from __future__ import annotations

import uuid

from sqlalchemy import func
from sqlalchemy.orm import Query

from ..core.extensions import db
from .models import Allergen


def get_by_id(allergen_id: uuid.UUID) -> Allergen | None:
    return db.session.get(Allergen, allergen_id)


def get_by_name(name: str) -> Allergen | None:
    return Allergen.query.filter(func.lower(Allergen.name) == name.lower()).first()


def list_query(q: str | None = None) -> Query:
    query = Allergen.query.order_by(Allergen.name)
    if q:
        query = query.filter(Allergen.name.ilike(f"{q}%"))
    return query


def add(allergen: Allergen) -> None:
    db.session.add(allergen)


def delete(allergen: Allergen) -> None:
    db.session.delete(allergen)


def commit() -> None:
    db.session.commit()


def rollback() -> None:
    db.session.rollback()
