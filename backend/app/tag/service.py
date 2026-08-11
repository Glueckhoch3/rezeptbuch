"""Tag service layer: business logic between routes and persistence."""

from __future__ import annotations

import uuid

from sqlalchemy.exc import IntegrityError

from ..core.errors import ApiError
from . import repository
from .models import Tag


def list_tags(q: str | None, page: int, page_size: int):
    from ..core.pagination import paginate

    return paginate(repository.list_query(q), page, page_size)


def get_tag(tag_id: uuid.UUID) -> Tag:
    tag = repository.get_by_id(tag_id)
    if tag is None:
        raise ApiError(f"Tag {tag_id} was not found.", status_code=404)
    return tag


def create_tag(data: dict) -> Tag:
    tag = Tag(name=data["name"].strip())
    repository.add(tag)
    try:
        repository.commit()
    except IntegrityError as exc:
        repository.rollback()
        raise ApiError(
            f"A tag named '{tag.name}' already exists.", status_code=409
        ) from exc
    return tag


def delete_tag(tag_id: uuid.UUID) -> None:
    tag = get_tag(tag_id)
    repository.delete(tag)
    repository.commit()


def resolve_or_create_by_name(name: str) -> Tag:
    """Find a master tag row by (case-insensitive) name, or create one."""
    existing = repository.get_by_name(name)
    if existing is not None:
        return existing
    tag = Tag(name=name.strip())
    repository.add(tag)
    repository.commit()
    return tag
