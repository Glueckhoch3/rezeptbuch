"""SQLAlchemy models for recipes, ingredients, and work instructions.

The data model mirrors the core recipe shape from the project documentation:
a recipe has a title, a description, a list of ingredients
(``[amount, unit, name]``), and an ordered list of work instructions.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Recipe(db.Model):
    """A single recipe with its ingredients and ordered instructions."""

    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    ingredients: Mapped[list["Ingredient"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="Ingredient.position",
    )
    instructions: Mapped[list["Instruction"]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="Instruction.step_number",
    )


class Ingredient(db.Model):
    """An ingredient line expressed as amount, unit, and name."""

    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False
    )
    # Position preserves the order ingredients were entered in.
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Amount is stored as text so values like "1/2" or "a pinch" are allowed.
    amount: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")


class Instruction(db.Model):
    """A single ordered work instruction step."""

    __tablename__ = "instructions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False
    )
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    recipe: Mapped["Recipe"] = relationship(back_populates="instructions")
