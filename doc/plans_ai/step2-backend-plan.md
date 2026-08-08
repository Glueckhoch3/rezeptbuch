# Step 2 — Backend Plan: Modular restructuring + new API surface

Status: proposal — builds on [`step1-database-plan.md`](step1-database-plan.md), extends [`0003-stack-and-container-topology.md`](../../.github/decisions/0003-stack-and-container-topology.md).

## Context

The current backend (`backend/app/`) is a flat package — `models.py`, `schemas.py`, `services.py`, `routes.py`, `errors.py`, `config.py`, `extensions.py` — organized by *layer*, not by *feature*. That works for a single-entity CRUD app but won't scale cleanly once `ingredient`, `tag`, `allergen`, and `workstep` are all real domains with their own endpoints. This plan restructures the backend into a modular, task-based layout (one folder per domain bundling its own models/schemas/repository/service/router) and defines the new API surface needed to support the step-1 data model. No auth is added — this stays a single shared local-network app.

## Target folder structure

```
backend/app/
  __init__.py                # app factory — unchanged responsibility, registers all domain blueprints
  core/
    config.py                 # moved from app/config.py, unchanged content
    extensions.py             # moved from app/extensions.py (db, migrate instances)
    errors.py                 # moved from app/errors.py (ApiError + handlers)
    db.py                     # NEW: shared UUID type decorator (Postgres UUID / SQLite String(36))
  recipe/
    models.py                 # Recipe
    schemas.py                # RecipeInputSchema, RecipeOutputSchema
    repository.py             # query/persist functions only, no business rules
    service.py                # create/update/delete/list/get, orchestrates worksteps/ingredients/tags
    router.py                 # Blueprint recipe_bp -> /api/recipes routes
  ingredient/
    models.py                 # Ingredient
    schemas.py
    repository.py
    service.py
    router.py                 # -> /api/ingredients
  tag/
    models.py                 # Tag (+ inline RecipeTag association model)
    schemas.py
    repository.py
    service.py
    router.py                 # -> /api/tags
  allergen/
    models.py                 # Allergen (+ inline IngredientAllergen association model)
    schemas.py
    repository.py
    service.py
    router.py                 # -> /api/allergens
  workstep/
    models.py                 # Workstep — kept as its own domain even though recipe-owned, mirrors the DB table 1:1
    schemas.py
  recipe_ingredient/
    models.py                 # RecipeIngredient — thin module, no service/router of its own; used by recipe.service
  search/
    service.py                # cross-domain filter/search logic (recipes by tag/ingredient/allergen/text)
    router.py                 # -> GET /api/recipes/search
  cli.py                       # unchanged location; seed data rewritten for the new shape
backend/wsgi.py                 # unchanged entrypoint
```

This is a **hybrid** layout: `core/` holds cross-cutting infrastructure, everything else is one folder per domain. Pure association tables (`recipe_tag`, `ingredient_allergen`) don't get their own module — their model class lives inline in the owning domain (`tag/models.py`, `allergen/models.py`) since they need no independent service or router. `search/` is a small module of its own because "filter recipes by tag+ingredient+allergen" doesn't belong to any single domain.

## Domain responsibilities and endpoints

| Domain | Endpoints | Notes |
|---|---|---|
| `recipe` | `GET/POST /api/recipes`, `GET/PUT/DELETE /api/recipes/{id}` | kept from today; response now nests `worksteps`, `ingredients` (with `amount`/`unit_override`), `tags` |
| `ingredient` | `GET/POST /api/ingredients`, `GET/PUT/DELETE /api/ingredients/{id}` | new — master CRUD, needed so the frontend can list/reuse/autocomplete ingredients across recipes |
| `tag` | `GET/POST /api/tags`, `DELETE /api/tags/{id}` | new — no `PUT`; renaming a tag is delete+recreate, kept intentionally simple |
| `allergen` | `GET/POST /api/allergens`, `DELETE /api/allergens/{id}` | new, same rationale as `tag` |
| `search` | `GET /api/recipes/search?tag=&ingredient=&allergen=&q=` | new — single endpoint, query params combine with AND semantics, avoids a combinatorial explosion of endpoints |
| — | `GET /api/health` | unchanged |

### Payload shape decision

`POST`/`PUT /api/recipes` accepts each ingredient line as **either** `ingredient_id` (reuse an existing master row) **or** a bare `name` string (the service resolves-or-creates the master `ingredient` row by name). This avoids forcing a two-step "create the ingredient first, then the recipe" UX while still building up the shared ingredient master table organically. Example request body:

```json
{
  "title": "Pancakes",
  "description": "Fluffy breakfast pancakes",
  "origin": "US",
  "tags": ["breakfast", "quick"],
  "ingredients": [
    { "ingredient_id": "…", "amount": "200", "unit_override": "g" },
    { "name": "Baking powder", "amount": "1", "unit_override": "tsp" }
  ],
  "worksteps": [
    { "title": "Mix", "description": "Combine dry ingredients." },
    { "title": "Cook", "description": "Fry on medium heat until golden." }
  ]
}
```

## OpenAPI documentation update

`doc/api-doc.yaml` gets:
- New `components/schemas` entries: `Ingredient`, `IngredientInput`, `Tag`, `Allergen`, `Workstep`, `RecipeIngredient`.
- Updated `Recipe`/`RecipeInput` schemas reflecting the nested `worksteps`/`ingredients`/`tags` shape above.
- New path blocks for `/api/ingredients`, `/api/ingredients/{id}`, `/api/tags`, `/api/tags/{id}`, `/api/allergens`, `/api/allergens/{id}`, `/api/recipes/search`.
- Existing `servers` entries unchanged.

## Environment variable review

No new environment variables are expected — the database connection contract (`DATABASE_URL` or `POSTGRES_USER/PASSWORD/HOST/PORT/DB`), `BACKEND_SECRET_KEY`, `CORS_ORIGINS`, `GUNICORN_WORKERS`, `SEED_ON_START`, `FLASK_ENV` all stay as-is. This must be explicitly re-checked once the UUID type decorator and any Postgres-specific behavior is implemented, in case an extension needs enabling — but the plan (application-side UUID generation, see step 1) is chosen specifically to avoid that.

## Testing plan

Mirror the domain folders under `backend/tests/`:

```
backend/tests/
  conftest.py           # unchanged location — shared app/client/db fixtures
  recipe/
    test_service.py
    test_router.py
  ingredient/
    test_service.py
    test_router.py
  tag/
    test_router.py
  allergen/
    test_router.py
  search/
    test_router.py
```

Each domain gets router-level (integration) tests matching the style of today's `tests/test_api.py`; `service.py` gets unit tests where business logic (e.g. resolve-or-create ingredient by name) is non-trivial. The SQLite-vs-Postgres UUID type-decorator introduced in step 1 must be validated here first, since all existing tests run against the in-memory SQLite `TestConfig`.

## ADR

Add one new ADR, `.github/decisions/0004-schema-v2-and-modular-backend.md`, covering both the schema v2 decision (step 1) and this backend restructuring together — they were decided together and this project's scale doesn't warrant splitting them into two ADRs. It should reference `step1-database-plan.md` and this document, and record the migration-replaces-0001 decision plus the domain-folder layout choice.

## Critical files

- `backend/app/__init__.py` — app factory, blueprint registration point
- `backend/app/routes.py` — to be split into per-domain `router.py` files
- `backend/app/services.py` — to be split into per-domain `service.py` files
- `backend/app/schemas.py` — to be split into per-domain `schemas.py` files
- `doc/api-doc.yaml` — OpenAPI contract to update

## Open questions / explicitly deferred

- Whether `ingredient`/`tag`/`allergen` list endpoints need pagination — deferred until data volume warrants it (same as step 1).
Answer: The projekt leader should give a frontend sketch first, so the extend of the pagination can be deffered from it. The pagination should then be included in the changes.
- Whether `PUT /api/recipes/{id}` should move from full-replace to partial-patch semantics now that the payload is more complex — kept as full-replace for now, consistent with ADR 0002's existing rationale ("simple to reason about").
Answer: Yes this PUT should use partial-patch semantics.
- Rate limiting / abuse protection on write endpoints — out of scope; this remains a local-network-only app per `doc/documentation.md`'s stated scope.
For security reasons a rate limiting / abuse protection meassure on the endpoints must be considered and the decision documented as in europe "secure by default" strategy is demanded (not for open source but it is still a good habit).
