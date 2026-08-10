"""Allergen model plus its pure link table to :class:`Ingredient`."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


class Allergen(db.Model):
    """Shared allergen master row, reused across ingredients."""

    __tablename__ = "allergen"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(63), nullable=False)

    ingredient_allergens: Mapped[list["IngredientAllergen"]] = relationship(
        back_populates="allergen", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ux_allergen_lower_name", func.lower(name), unique=True),)


class IngredientAllergen(db.Model):
    """Pure link table between :class:`Ingredient` and :class:`Allergen`."""

    __tablename__ = "ingredient_allergen"

    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("ingredient.id", ondelete="CASCADE"), primary_key=True
    )
    allergen_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("allergen.id", ondelete="CASCADE"), primary_key=True
    )

    ingredient: Mapped["Ingredient"] = relationship(  # noqa: F821
        back_populates="ingredient_allergens"
    )
    allergen: Mapped["Allergen"] = relationship(back_populates="ingredient_allergens")
