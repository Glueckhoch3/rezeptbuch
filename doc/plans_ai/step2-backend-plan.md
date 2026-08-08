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
| `recipe` | `GET/POST /api/recipes`, `GET/PATCH/DELETE /api/recipes/{id}` | `GET /api/recipes` paginated (`page`/`page_size`, keyset on `created_at,id`); response now nests `worksteps`, `ingredients` (with `amount`/`unit`), `tags`; `PATCH` replaces `PUT` — see partial-patch decision below |
| `ingredient` | `GET/POST /api/ingredients`, `GET/PUT/DELETE /api/ingredients/{id}` | new — master CRUD, needed so the frontend can list/reuse/autocomplete ingredients across recipes; `GET` list paginated and supports `?q=` prefix search for autocomplete |
| `tag` | `GET/POST /api/tags`, `DELETE /api/tags/{id}` | new — no `PUT`/`PATCH`; renaming a tag is delete+recreate, kept intentionally simple; `GET` list paginated and supports `?q=` prefix search for autocomplete |
| `allergen` | `GET/POST /api/allergens`, `DELETE /api/allergens/{id}` | new, same rationale as `tag`; `GET` list paginated |
| `search` | `GET /api/recipes/search?tag=&ingredient=&allergen=&q=&page=&page_size=` | new — single endpoint, query params combine with AND semantics, avoids a combinatorial explosion of endpoints; paginated like the plain recipe list |
| — | `GET /api/health` | unchanged |

### Pagination shape

All list endpoints (`recipe`, `ingredient`, `tag`, `allergen`, `search`) accept `page`/`page_size` (default `page_size` capped, e.g. 20/max 100) and return `{"items": [...], "page": n, "page_size": n, "total": n}`. Exact page-size defaults and whether `ingredient`/`tag` autocomplete uses the same paginated shape or a lighter-weight top-N response is informed by the step-3 frontend sketch (autocomplete widgets typically want "top N matches", not a full pager) — finalize the response envelope for `?q=` autocomplete lookups when step 3's `IngredientPicker`/`TagPicker` components are designed, but the pagination mechanism itself ships now rather than being retrofitted later.

### Payload shape decision

`POST /api/recipes` accepts each ingredient line as **either** `ingredient_id` (reuse an existing master row) **or** a bare `name` string (the service resolves-or-creates the master `ingredient` row by name). This avoids forcing a two-step "create the ingredient first, then the recipe" UX while still building up the shared ingredient master table organically. Example request body:

```json
{
  "title": "Pancakes",
  "description": "Fluffy breakfast pancakes",
  "origin": "US",
  "tags": ["breakfast", "quick"],
  "ingredients": [
    { "ingredient_id": "…", "amount": "200", "unit": "g" },
    { "name": "Baking powder", "amount": "1", "unit": "tsp" }
  ],
  "worksteps": [
    { "title": "Mix", "description": "Combine dry ingredients." },
    { "title": "Cook", "description": "Fry on medium heat until golden." }
  ]
}
```

### `PATCH /api/recipes/{id}`: partial-patch semantics

Reversing ADR 0002's original "simple to reason about" full-replace rationale: `PUT` is replaced with `PATCH`, and only the top-level fields present in the request body are updated. For the nested collections (`ingredients`, `worksteps`, `tags`), "present" is collection-level, not element-level — supplying `ingredients` still replaces the whole ingredient list wholesale (matching `services.py`'s existing collection-replace behavior noted in `CLAUDE.md`), it just means the caller can omit `ingredients` entirely to leave it untouched, whereas today's full-replace `PUT` would have required resending the complete recipe on every edit (e.g. renaming just the title). Validation schema becomes `RecipePatchSchema` with all fields optional; `RecipeInputSchema` (all fields required) remains for `POST`.

## OpenAPI documentation update

`doc/api-doc.yaml` gets:
- New `components/schemas` entries: `Ingredient`, `IngredientInput`, `Tag`, `Allergen`, `Workstep`, `RecipeIngredient`.
- Updated `Recipe`/`RecipeInput` schemas reflecting the nested `worksteps`/`ingredients`/`tags` shape above.
- New path blocks for `/api/ingredients`, `/api/ingredients/{id}`, `/api/tags`, `/api/tags/{id}`, `/api/allergens`, `/api/allergens/{id}`, `/api/recipes/search`.
- Existing `servers` entries unchanged.

## Rate limiting / abuse protection

Reversing the earlier "out of scope, local-network-only" call: a baseline rate limit is added to write endpoints (`POST`/`PATCH`/`PUT`/`DELETE` across all domains) even though the app has no auth and no internet exposure. Rationale: "secure by default" is treated as a habit to build, not a control sized to this specific deployment's threat model — a local-network app today can end up reachable more broadly tomorrow (a misconfigured port-forward, a container exposed by a different compose file), and the cost of the control is low.

- **Mechanism**: `Flask-Limiter`, in-memory storage (no Redis dependency — matches the app's current lack of a cache/session store), keyed by remote address.
- **Limits**: generous defaults appropriate for a trusted local network, not a public API — e.g. 60 write requests/minute per IP, with `/api/health` and all `GET` endpoints exempt. Exact numbers are a tuning detail for step 2's execution, not this plan.
- **Response**: `429` normalized through the existing `errors.py` handler shape (`{"error": "...", "details": {...}}`), consistent with every other error path.
- **Documentation**: recorded as its own ADR, `.github/decisions/0005-baseline-rate-limiting.md`, explicitly stating the "secure by default" rationale so a future reader doesn't mistake this for defense against a real observed threat.

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

Each domain gets router-level (integration) tests matching the style of today's `tests/test_api.py`; `service.py` gets unit tests where business logic (e.g. resolve-or-create ingredient by name) is non-trivial. The SQLite-vs-Postgres UUID type-decorator introduced in step 1 must be validated here first, since all existing tests run against the in-memory SQLite `TestConfig`. Each domain's router tests also cover pagination (`page`/`page_size` params, envelope shape) and, for `recipe`, the `PATCH` partial-update behavior (omitted fields left untouched). Rate limiting gets its own focused test (e.g. exceed the write-endpoint limit, assert `429` with the normalized error shape) rather than being asserted redundantly in every domain's test file.

## ADR

Add one new ADR, `.github/decisions/0004-schema-v2-and-modular-backend.md`, covering both the schema v2 decision (step 1) and this backend restructuring together — they were decided together and this project's scale doesn't warrant splitting them into two ADRs. It should reference `step1-database-plan.md` and this document, and record the migration-replaces-0001 decision plus the domain-folder layout choice.

Add a second new ADR, `.github/decisions/0005-baseline-rate-limiting.md`, covering the rate-limiting decision above on its own — it's an orthogonal security-posture call, not part of the schema/layout decision.

## Critical files

- `backend/app/__init__.py` — app factory, blueprint registration point
- `backend/app/routes.py` — to be split into per-domain `router.py` files
- `backend/app/services.py` — to be split into per-domain `service.py` files
- `backend/app/schemas.py` — to be split into per-domain `schemas.py` files
- `doc/api-doc.yaml` — OpenAPI contract to update

## Resolved decisions (previously open)

- **Pagination on `ingredient`/`tag`/`allergen` list endpoints.** Included (see "Pagination shape" above) rather than deferred. The exact page size and whether autocomplete gets a lighter "top N" response shape instead of the full paginated envelope should be finalized against a frontend sketch (step 3) before implementation, so the API isn't over- or under-built relative to the actual UI.
- **`PUT` vs. partial-patch on `/api/recipes/{id}`.** Moved to partial-patch semantics — see the "`PATCH /api/recipes/{id}`" section above. This reverses ADR 0002's original full-replace rationale.
- **Rate limiting / abuse protection.** Added as a baseline control on all write endpoints despite the local-network-only deployment — see "Rate limiting / abuse protection" above. Framed explicitly as a "secure by default" habit rather than a response to an observed threat, and documented in its own ADR (0005) so that rationale isn't lost.
