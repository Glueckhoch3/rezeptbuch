"""RecipeIngredient model: a recipe's use of a shared ingredient."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


class RecipeIngredient(db.Model):
    """A recipe's use of a shared ingredient: per-recipe amount/unit/position.

    Keyed by ``(recipe_id, ingredient_id)`` rather than a surrogate id —
    nothing references this row from elsewhere, and the composite key
    doubles as the "no duplicate ingredient in one recipe" constraint.
    """

    __tablename__ = "recipe_ingredient"

    recipe_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("recipe.id", ondelete="CASCADE"), primary_key=True
    )
    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("ingredient.id", ondelete="RESTRICT"), primary_key=True
    )
    # Amount is free text, not numeric — allows values like "1/2" or "a pinch".
    amount: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(31), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    recipe: Mapped["Recipe"] = relationship(  # noqa: F821
        back_populates="recipe_ingredients"
    )
    ingredient: Mapped["Ingredient"] = relationship(  # noqa: F821
        back_populates="recipe_ingredients"
    )

    __table_args__ = (Index("ix_recipe_ingredient_ingredient_id", "ingredient_id"),)
