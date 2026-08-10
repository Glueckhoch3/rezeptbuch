"""Allergen service layer: business logic between routes and persistence."""

from __future__ import annotations

import uuid

from sqlalchemy.exc import IntegrityError

from ..core.errors import ApiError
from . import repository
from .models import Allergen


def list_allergens(q: str | None, page: int, page_size: int):
    from ..core.pagination import paginate

    return paginate(repository.list_query(q), page, page_size)


def get_allergen(allergen_id: uuid.UUID) -> Allergen:
    allergen = repository.get_by_id(allergen_id)
    if allergen is None:
        raise ApiError(f"Allergen {allergen_id} was not found.", status_code=404)
    return allergen


def create_allergen(data: dict) -> Allergen:
    allergen = Allergen(name=data["name"].strip())
    repository.add(allergen)
    try:
        repository.commit()
    except IntegrityError as exc:
        repository.rollback()
        raise ApiError(
            f"An allergen named '{allergen.name}' already exists.", status_code=409
        ) from exc
    return allergen


def delete_allergen(allergen_id: uuid.UUID) -> None:
    allergen = get_allergen(allergen_id)
    repository.delete(allergen)
    repository.commit()
