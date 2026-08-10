# 0004 - Schema v2 and modular backend restructuring

Date: 2026-08-10
Status: Accepted

## Context
The original schema (`0002-data-model-and-api-shape.md`) modeled a recipe as
`title`/`description`/free-text `ingredients`/`instructions`, with no shared
vocabulary across recipes. `doc/plans_ai/step1-database-plan.md` replaces this
with a normalized data model — a shared, reusable `ingredient` master table,
`tag` and `allergen` master tables, and explicit ordered `workstep` and
`recipe_ingredient` join rows — so recipes can be filtered by tag/ingredient/
allergen and autocompleted against instead of fragmenting on free-text typos.

The backend (`backend/app/`) was a flat package organized by layer
(`models.py`, `schemas.py`, `services.py`, `routes.py`). That worked for a
single-entity CRUD app but doesn't scale cleanly once `ingredient`, `tag`,
`allergen`, and `workstep` are each real domains with their own endpoints.
`doc/plans_ai/step2-backend-plan.md` covers both changes together, decided
together, at a scale that doesn't warrant separate ADRs.

## Decision

### Schema v2
- New tables: `recipe`, `workstep`, `ingredient`, `recipe_ingredient`, `tag`,
  `recipe_tag`, `allergen`, `ingredient_allergen`.
- Primary keys are UUIDs generated application-side, stored as native `UUID`
  on PostgreSQL and `CHAR(36)` on SQLite (`app/core/db.py::GUID`).
- `workstep` and `recipe_ingredient` are keyed by their natural composite key
  (`(recipe_id, step_number)` / `(recipe_id, ingredient_id)`) rather than a
  surrogate id.
- `migrations/versions/0001_initial.py` is a fresh initial revision that
  replaces the old schema wholesale — there is no production data to
  preserve, so this is not an incremental `ALTER` chain.
- `PUT /api/recipes/{id}` is replaced by `PATCH` with partial-update
  semantics at the top-level-field granularity (nested collections are still
  replaced wholesale when supplied). This reverses ADR 0002's original
  full-replace rationale now that editing a single field would otherwise
  require resending the whole recipe.

### Modular backend layout
`backend/app/` moves from layer-based to a hybrid domain-based layout:

```
app/
  core/            # config, extensions, errors, GUID type, pagination helper
  recipe/          # models, schemas, repository, service, router
  ingredient/       # models, schemas, repository, service, router
  tag/             # models (+ inline RecipeTag), schemas, repository, service, router
  allergen/        # models (+ inline IngredientAllergen), schemas, repository, service, router
  workstep/        # models, schemas — no service/router, owned by recipe
  recipe_ingredient/ # models — no service/router, owned by recipe
  search/          # cross-domain filter service + router
```

Pure association tables (`recipe_tag`, `ingredient_allergen`) live inline in
the owning domain rather than getting their own module, since they need no
independent service or router. `search/` is its own small module because
"filter recipes by tag+ingredient+allergen" doesn't belong to any single
domain.

New endpoints: `GET/POST /api/ingredients`, `GET/PUT/DELETE
/api/ingredients/{id}`, `GET/POST /api/tags`, `DELETE /api/tags/{id}`,
`GET/POST /api/allergens`, `DELETE /api/allergens/{id}`, `GET
/api/recipes/search`. `tag`/`allergen` intentionally have no `PUT`/`PATCH` —
renaming is delete+recreate. All list endpoints are paginated
(`page`/`page_size`, envelope `{"items", "page", "page_size", "total"}`).

## Consequences
- Each domain is self-contained (its own models/schemas/repository/service/
  router), so adding a new domain no longer means touching one giant
  `models.py`/`schemas.py`/`services.py`/`routes.py`.
- `recipe.service` depends on `ingredient.service` and `tag.service` for
  resolve-or-create-by-name; `search.service` depends on all four domains'
  models for its filter joins. These are the only cross-domain dependencies.
- The API is now UUID-keyed everywhere instead of integer-keyed, which is a
  breaking change for the frontend (addressed together with step 3).
- `doc/api-doc.yaml` and `backend/tests/` are restructured to mirror the new
  domain layout and API surface.

## Alternatives considered
- Keeping the flat layer-based layout and just adding more functions to the
  existing `models.py`/`schemas.py`/`services.py`: rejected — four new
  domains would have made those files unwieldy.
- A fully "package per layer per domain" split with no `core/`: rejected —
  config/extensions/errors/GUID/pagination are genuinely cross-cutting and
  don't belong to any one domain.
- Keeping `PUT` full-replace: rejected — nested collections already replace
  wholesale, but forcing a full recipe resend to rename a title creates
  needless payload size and race-condition surface as the frontend adds more
  fields (tags, origin).

## References
- `doc/plans_ai/step1-database-plan.md`, `doc/plans_ai/step2-backend-plan.md`
- `backend/app/`, `backend/migrations/versions/0001_initial.py`,
  `doc/api-doc.yaml`
- Supersedes the data-model and `PUT`-replace parts of
  `0002-data-model-and-api-shape.md`.
