"""Workstep model: an ordered work instruction step owned by a recipe."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


class Workstep(db.Model):
    """An ordered work instruction step, keyed by ``(recipe_id, step_number)``."""

    __tablename__ = "workstep"

    recipe_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("recipe.id", ondelete="CASCADE"), primary_key=True
    )
    step_number: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    recipe: Mapped["Recipe"] = relationship(back_populates="worksteps")  # noqa: F821
