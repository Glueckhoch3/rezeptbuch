"""Query/persist functions for :class:`Tag`. No business rules here."""

from __future__ import annotations

import uuid

from sqlalchemy import func
from sqlalchemy.orm import Query

from ..core.extensions import db
from .models import Tag


def get_by_id(tag_id: uuid.UUID) -> Tag | None:
    return db.session.get(Tag, tag_id)


def get_by_name(name: str) -> Tag | None:
    return Tag.query.filter(func.lower(Tag.name) == name.lower()).first()


def list_query(q: str | None = None) -> Query:
    query = Tag.query.order_by(Tag.name)
    if q:
        query = query.filter(Tag.name.ilike(f"{q}%"))
    return query


def add(tag: Tag) -> None:
    db.session.add(tag)


def delete(tag: Tag) -> None:
    db.session.delete(tag)


def commit() -> None:
    db.session.commit()


def rollback() -> None:
    db.session.rollback()
