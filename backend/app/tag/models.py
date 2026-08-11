"""Tag model plus its pure link table to :class:`Recipe`."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.db import GUID
from ..core.extensions import db


class Tag(db.Model):
    """Shared tag master row, reused across recipes."""

    __tablename__ = "tag"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(63), nullable=False)

    recipe_tags: Mapped[list["RecipeTag"]] = relationship(
        back_populates="tag", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ux_tag_lower_name", func.lower(name), unique=True),)


class RecipeTag(db.Model):
    """Pure link table between :class:`Recipe` and :class:`Tag`."""

    __tablename__ = "recipe_tag"

    recipe_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("recipe.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True
    )

    recipe: Mapped["Recipe"] = relationship(back_populates="recipe_tags")  # noqa: F821
    tag: Mapped["Tag"] = relationship(back_populates="recipe_tags")

    __table_args__ = (Index("ix_recipe_tag_tag_id", "tag_id"),)
