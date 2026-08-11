"""Ingredient model: shared ingredient master row, reused across recipes."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Ingredient(db.Model):
    """Shared ingredient master row, reused across recipes."""

    __tablename__ = "ingredient"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Free-text notes about the ingredient; replaces the old "type" column.
    # Unit always lives on RecipeIngredient — an ingredient has no default unit.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    recipe_ingredients: Mapped[list["RecipeIngredient"]] = relationship(  # noqa: F821
        back_populates="ingredient"
    )
    ingredient_allergens: Mapped[list["IngredientAllergen"]] = (  # noqa: F821
        relationship(back_populates="ingredient", cascade="all, delete-orphan")
    )

    __table_args__ = (Index("ux_ingredient_lower_name", func.lower(name), unique=True),)
