# 0002 - Data model and REST API shape

Date: 2026-06-15
Status: Accepted

## Context
The application needs to persist recipes consisting of a title, a description,
a list of ingredients (`amount`, `unit`, `name`), and an ordered list of work
instructions. The frontend needs a predictable, explicit request/response
contract for CRUD operations.

## Decision
Use a normalized relational model with three tables:

- `recipes` — `id`, `title`, `description`, `created_at`, `updated_at`
- `ingredients` — `id`, `recipe_id` (FK, cascade delete), `position`, `amount`,
  `unit`, `name`
- `instructions` — `id`, `recipe_id` (FK, cascade delete), `step_number`, `text`

Ingredient `amount` is stored as a string (not numeric) so values such as
`"1/2"` or `"a pinch"` are allowed. Ordering is explicit: ingredients use
`position`, instructions use `step_number`, both assigned server-side from the
incoming array order.

The REST API is grouped under `/api`:

- `GET /api/recipes` · `POST /api/recipes`
- `GET /api/recipes/{id}` · `PUT /api/recipes/{id}` · `DELETE /api/recipes/{id}`
- `GET /api/health`

`PUT` replaces the full recipe (including child collections) rather than
patching, keeping update semantics simple and predictable.

## Consequences
- Cascade delete keeps child rows consistent when a recipe is removed.
- Replacing collections on update is simple to reason about but rewrites all
  ingredient/instruction rows on every edit (acceptable at this scale).
- The contract is documented in `doc/api-doc.yaml` and mirrored by the
  frontend `types.ts`.

## Alternatives considered
- Storing ingredients/instructions as JSON columns on the recipe row: simpler
  schema but loses queryability and clean validation per item.
- `PATCH`-style partial updates: more flexible but more complex client and
  server logic than this use case warrants.

## References
- `doc/documentation.md`, `doc/implementation-plan.md`
- `backend/app/models.py`, `backend/app/schemas.py`, `doc/api-doc.yaml`
