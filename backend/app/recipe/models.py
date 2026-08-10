"""Recipe model: title/description/origin plus its worksteps, ingredients, tags."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Recipe(db.Model):
    """A recipe: title/description/origin plus its worksteps, ingredients, and tags."""

    __tablename__ = "recipe"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False, default="")
    origin: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    worksteps: Mapped[list["Workstep"]] = relationship(  # noqa: F821
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="Workstep.step_number",
    )
    recipe_ingredients: Mapped[list["RecipeIngredient"]] = relationship(  # noqa: F821
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.position",
    )
    recipe_tags: Mapped[list["RecipeTag"]] = relationship(  # noqa: F821
        back_populates="recipe", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_recipe_created_at_id", "created_at", "id"),)
