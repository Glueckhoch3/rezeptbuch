"""recipe/ingredient/tag/allergen data model (v2)

Replaces the old recipes/ingredients/instructions schema wholesale per
doc/plans_ai/step1-database-plan.md — there is no production data to
preserve, so this is a fresh initial revision rather than an incremental
ALTER chain.

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-10

"""

import uuid

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


class _GUID(sa.TypeDecorator):
    """Local copy of app.models.GUID, frozen here so this migration stays a
    correct point-in-time snapshot even if the live model's type changes."""

    impl = sa.CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(sa.CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        value = value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
        return value if dialect.name == "postgresql" else str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


def upgrade():
    op.create_table(
        "recipe",
        sa.Column("id", _GUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=False),
        sa.Column("origin", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_recipe_created_at_id", "recipe", ["created_at", "id"])

    op.create_table(
        "workstep",
        sa.Column("recipe_id", _GUID(), nullable=False),
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipe.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("recipe_id", "step_number"),
    )

    op.create_table(
        "ingredient",
        sa.Column("id", _GUID(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ux_ingredient_lower_name",
        "ingredient",
        [sa.text("lower(name)")],
        unique=True,
    )

    op.create_table(
        "recipe_ingredient",
        sa.Column("recipe_id", _GUID(), nullable=False),
        sa.Column("ingredient_id", _GUID(), nullable=False),
        sa.Column("amount", sa.String(length=50), nullable=False),
        sa.Column("unit", sa.String(length=31), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipe.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["ingredient_id"], ["ingredient.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("recipe_id", "ingredient_id"),
    )
    op.create_index(
        "ix_recipe_ingredient_ingredient_id", "recipe_ingredient", ["ingredient_id"]
    )

    op.create_table(
        "tag",
        sa.Column("id", _GUID(), nullable=False),
        sa.Column("name", sa.String(length=63), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ux_tag_lower_name", "tag", [sa.text("lower(name)")], unique=True)

    op.create_table(
        "recipe_tag",
        sa.Column("recipe_id", _GUID(), nullable=False),
        sa.Column("tag_id", _GUID(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipe.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tag.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("recipe_id", "tag_id"),
    )
    op.create_index("ix_recipe_tag_tag_id", "recipe_tag", ["tag_id"])

    op.create_table(
        "allergen",
        sa.Column("id", _GUID(), nullable=False),
        sa.Column("name", sa.String(length=63), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ux_allergen_lower_name", "allergen", [sa.text("lower(name)")], unique=True
    )

    op.create_table(
        "ingredient_allergen",
        sa.Column("ingredient_id", _GUID(), nullable=False),
        sa.Column("allergen_id", _GUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["ingredient_id"], ["ingredient.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["allergen_id"], ["allergen.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("ingredient_id", "allergen_id"),
    )

    # PostgreSQL-only DDL: full-text search vector plus GIN index, and
    # trigram/pattern-friendly prefix indexes for autocomplete. Skipped on
    # any other dialect (this migration otherwise only ever targets Postgres
    # in this project; SQLite tests build their schema from the ORM models
    # via db.create_all() instead of running migrations).
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            """
            ALTER TABLE recipe ADD COLUMN search_vector tsvector
            GENERATED ALWAYS AS (
                setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(description, '')), 'B')
            ) STORED
            """
        )
        op.execute(
            "CREATE INDEX ix_recipe_search_vector ON recipe USING GIN (search_vector)"
        )
        op.execute(
            "CREATE INDEX ix_ingredient_name_pattern"
            " ON ingredient (name text_pattern_ops)"
        )
        op.execute("CREATE INDEX ix_tag_name_pattern ON tag (name text_pattern_ops)")


def downgrade():
    op.drop_table("ingredient_allergen")
    op.drop_table("allergen")
    op.drop_table("recipe_tag")
    op.drop_table("tag")
    op.drop_table("recipe_ingredient")
    op.drop_table("ingredient")
    op.drop_table("workstep")
    op.drop_table("recipe")
