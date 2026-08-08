# Step 1 — Database Plan: Data model v2

Status: proposal — superseded [`0002-data-model-and-api-shape.md`](../../.github/decisions/0002-data-model-and-api-shape.md).

## Context

`doc/Rezeptbuch_database_model.json` is a drawDB-style diagram export (not executable DDL) sketching the intent for the overhaul: shared, reusable ingredients; recipe tags; per-ingredient allergen tracking; and worksteps replacing the old numbered instructions. It has rough edges — a typo, no per-recipe ingredient quantity, no timestamps, and every foreign key left at "No action" (which Postgres treats as `RESTRICT`, silently blocking deletes). This document refines that sketch into a concrete relational model to implement in step 2. There is no running instance or data to preserve, so refinement is free — nothing here needs to stay backward compatible with the current `recipes`/`ingredients`/`instructions` schema.

## Decisions at a glance

| Question | Decision | Rationale |
|---|---|---|
| `ingredient_list` join table: plain link or own entity? | Rename to `recipe_ingredient`, give it its own PK plus `amount`/`unit_override` | A shared ingredient still needs a per-recipe quantity ("200g flour in *this* recipe") — a bare link table can't carry that |
| Tags: shared table or a string per recipe row? | Shared `tag` master + `recipe_tag` join | Enables autocomplete and "browse by tag" without free-text typos fragmenting the tag space ("Vegan" vs "vegan") |
| Allergens: shared table or free text per ingredient? | Shared `allergen` master + `ingredient_allergen` join | Same reasoning as tags — allergens are a small, roughly fixed vocabulary that benefits from consistency for filtering |
| Primary key strategy | UUID everywhere, generated **application-side** (`uuid.uuid4()` as the SQLAlchemy column default) | Matches the JSON model's intent (non-guessable IDs) without requiring a Postgres extension (`pgcrypto`/`uuid-ossp`) — keeps the existing SQLite in-memory test setup working unmodified |
| Timestamps | `created_at`/`updated_at` only on `recipe` and `ingredient` | Only entities with an independent lifecycle need audit fields; pure join tables stay lean |
| Foreign key cascade behavior | Explicit per relationship (see below) | The raw JSON leaves every FK at "No action", which is a latent bug, not a real decision |

## Finalized tables

### `recipe`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | app-generated |
| `title` | VARCHAR(255) NOT NULL | |
| `description` | TEXT NOT NULL DEFAULT '' | fixes the `decription` typo in the JSON model |
| `origin` | VARCHAR(255) NULL | |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

### `workstep` (replaces `instructions`)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `recipe_id` | UUID NOT NULL, FK → `recipe.id` | `ON DELETE CASCADE` |
| `step_number` | INT NOT NULL | renamed from the JSON's ambiguous `workstep` column name |
| `title` | VARCHAR(120) NOT NULL | bumped from the JSON's VARCHAR(31), too short for a real step title |
| `description` | TEXT NOT NULL | |

Constraints: `UNIQUE (recipe_id, step_number)`. Index: `(recipe_id, step_number)`.

### `ingredient` (shared master)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `name` | VARCHAR(120) NOT NULL | bumped from VARCHAR(63) |
| `default_unit` | VARCHAR(31) NULL | renamed from the JSON's `unit`; nullable because a master ingredient may not have one fixed unit — the actual per-recipe unit lives on `recipe_ingredient.unit_override` |
| `type` | VARCHAR(120) NULL | loose categorical string (e.g. "produce", "dairy"); not an enum/table — kept simple |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Constraint: `UNIQUE (lower(name))` — prevents duplicate master rows differing only in case.

### `recipe_ingredient` (replaces `ingredient_list`)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `recipe_id` | UUID NOT NULL, FK → `recipe.id` | `ON DELETE CASCADE` |
| `ingredient_id` | UUID NOT NULL, FK → `ingredient.id` | `ON DELETE RESTRICT` — see cascade rules below |
| `amount` | VARCHAR(50) NOT NULL DEFAULT '' | string, not numeric — allows "1/2", "a pinch" (matches the current app's existing choice) |
| `unit_override` | VARCHAR(31) NULL | per-recipe unit when it differs from `ingredient.default_unit` |
| `position` | INT NOT NULL DEFAULT 0 | display order, mirrors the current app's `Ingredient.position` |

Constraint: `UNIQUE (recipe_id, ingredient_id)` — the same ingredient listed twice in one recipe is a data error. Indexes: `(recipe_id)`, `(ingredient_id)` (for "recipes using ingredient X").

### `tag` (shared master) + `recipe_tag` (join)
- `tag`: `id` UUID PK, `name` VARCHAR(63) NOT NULL, `UNIQUE (lower(name))`.
- `recipe_tag`: `recipe_id` FK → `recipe.id` (`CASCADE`), `tag_id` FK → `tag.id` (`CASCADE`); composite PK `(recipe_id, tag_id)` — no surrogate id needed, it's a pure link. Index on `(tag_id)` for "recipes with tag X".

### `allergen` (shared master) + `ingredient_allergen` (join, replaces `allergene`)
- `allergen`: `id` UUID PK, `name` VARCHAR(63) NOT NULL, `UNIQUE (lower(name))`.
- `ingredient_allergen`: `ingredient_id` FK → `ingredient.id` (`CASCADE`), `allergen_id` FK → `allergen.id` (`CASCADE`); composite PK `(ingredient_id, allergen_id)`.

## Cascade rules summary

The raw JSON model leaves every relationship at "No action". This plan fixes that explicitly:

- **`recipe` deletion** → cascades to `workstep`, `recipe_ingredient`, `recipe_tag` (all recipe-owned, no reason to keep orphans).
- **`ingredient` deletion** → **RESTRICT** if referenced by any `recipe_ingredient` row (protects existing recipes from silently losing an ingredient out from under them); cascades to `ingredient_allergen` (allergen tagging is ingredient-owned metadata with no independent value).
- **`tag` / `allergen` deletion** → cascades through their join tables only (removing a tag/allergen globally removes it from all recipes/ingredients — acceptable for master-data cleanup at this scale).

## Rationale vs. the raw JSON model

- Fixed `decription` → `description` typo on `recipe`.
- `ingredient_list` → `recipe_ingredient`: needed its own identity plus `amount`/`unit_override`, otherwise "200g flour in recipe X" is unexpressible once ingredients are shared.
- `tags` and `allergene` promoted from per-row strings to master + join tables: enables autocomplete, prevents typo-fragmented tag/allergen spaces, and is a prerequisite for the search/filter feature planned in step 2.
- Added `created_at`/`updated_at` on `recipe` and `ingredient` (independent lifecycle); omitted on pure join tables to keep them lean.
- All FKs given explicit cascade behavior instead of "No action".
- Column sizes revisited: `workstep.title` 31→120, `ingredient.name` 63→120 — both were unrealistically short for real content.

## Migration strategy

No production data exists yet worth preserving (study project, no running instance) — plan a **single fresh Alembic revision** that replaces `backend/migrations/versions/0001_initial.py` wholesale: drop the old `ingredients`/`instructions` tables, create all 8 new tables (`recipe`, `workstep`, `ingredient`, `recipe_ingredient`, `tag`, `recipe_tag`, `allergen`, `ingredient_allergen`). No incremental `ALTER`-based migration chain is needed.

`backend/app/cli.py`'s `seed` command will need new seed data matching this shape (ingredient master rows referenced by multiple recipes, at least one tag and allergen) — flagged here, implemented in step 2's execution.

## Preview: mapping to SQLAlchemy (detail lives in step 2)

UUID primary keys should use a small type-decorator so the same model code works against both Postgres (`sqlalchemy.dialects.postgresql.UUID(as_uuid=True)`) and the SQLite in-memory database used by `backend/tests/conftest.py` (`String(36)` fallback). This is called out explicitly because it's the one technical risk in the "UUIDs everywhere" decision — it must be resolved in step 2 before the existing test setup is touched.

## Critical files

- `doc/Rezeptbuch_database_model.json` — source sketch this plan refines
- `backend/app/models.py` — current models to be replaced
- `backend/migrations/versions/0001_initial.py` — migration to be replaced
- `.github/decisions/0002-data-model-and-api-shape.md` — ADR this plan supersedes
- `doc/api-doc.yaml` — API contract to be updated in step 2

## Open questions / explicitly deferred

- Full-text search on `recipe.title`/`description` (e.g. Postgres `tsvector` + GIN index) — not needed yet, revisit once the search/filter feature (step 2) is in place and recipe volume grows.
Answer: Prepare for a full text search on recipe.title/description. Add a recipe by tag and ingredient filter where the tag or ingredient can be typed and autofilled from a list of matching names (like: carr -> carrot; veg -> vegan, vegetarian).

- Pagination on list endpoints — deferred until recipe/ingredient counts make it necessary.
Answer: Also plan to include pagination on list endpoints from the beginning.

- Whether `ingredient.type` should become its own lookup table instead of a free string — revisit if the app ever needs to filter/group by ingredient type; not worth the complexity now.
Answer: remove ingredient type and replace it with a ingredient.description field, also move the unit field into the recipe_ingredient list with the amount that has to be added.