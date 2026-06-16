# rezeptbuch Documentation

## Project identity & goals
`rezeptbuch` is a local-network recipe hub. It is intended to let users create, edit, remove, and browse recipes from a browser on the local network.

The core recipe shape is:
- title
- description
- ingredients as a list of `[amount, unit, name]`
- ordered work instructions

## Scope
This repository covers the web application and its supporting runtime stack.

In scope:
- React frontend for recipe management and browsing
- Flask backend for validation, persistence, and API access
- PostgreSQL database running in Docker
- shared configuration through a root-level `.env` plus a checked-in `.env.example`

Out of scope:
- public internet exposure
- complex recommendation feature

## Architecture overview
The target deployment uses three containers:
- frontend container for the React app
- backend container for the Flask API
- database container for PostgreSQL

The frontend talks to the backend over HTTP. The backend owns validation, persistence rules, and API shape. The database stores recipe data and related records.

```mermaid
graph LR
    Browser["🌐 Browser"]
    Frontend["Frontend<br/>nginx + SPA<br/>(port 80)"]
    Backend["Backend<br/>Flask + ORM<br/>(port 5000)"]
    Database["Database<br/>PostgreSQL<br/>(port 5432)"]
    
    Browser -->|http<br/>/, /recipes/...| Frontend
    Frontend -->|/api/*<br/>proxy, JSON| Backend
    Backend -->|JSON| Frontend
    Backend -->|SQL| Database
    Database -->|rows| Backend
    
    style Browser fill:#f0f0f0
    style Frontend fill:#e8f4f8
    style Backend fill:#e8f4f8
    style Database fill:#e8f4f8
```

In production nginx serves the built React app and proxies `/api` to the
backend, so the browser uses a single origin. In development the Vite dev
server (port 5173) proxies `/api` to the backend instead.

Main request flows (all JSON over HTTP):
- **list recipes** — `GET /api/recipes` → backend queries all recipes (newest
  first) → serialized array.
- **create recipe** — `POST /api/recipes` → schema validation → service inserts
  recipe + ordered ingredients/instructions → `201` with the new recipe.
- **update recipe** — `PUT /api/recipes/{id}` → validation → service replaces
  fields and child collections → `200` with the updated recipe.
- **delete recipe** — `DELETE /api/recipes/{id}` → service deletes recipe
  (children cascade) → `204`.

The full contract is specified in [`api-doc.yaml`](api-doc.yaml).

## Service boundaries
Frontend responsibilities:
- render forms, lists, and detail views
- validate obvious user input before submit
- call backend APIs
- keep presentation state local to the UI

Backend responsibilities:
- define API routes and request schemas
- validate recipe payloads
- translate API operations into database actions
- return consistent error responses

Database responsibilities:
- persist recipes, ingredients, and work instructions
- support schema migrations and safe data updates

## Implementation decisions (ADRs)
Durable decisions are recorded in `.github/decisions/`:
- [0001](../.github/decisions/0001-record-architecture-decision.md) — ADR template
- [0002](../.github/decisions/0002-data-model-and-api-shape.md) — data model and REST API shape
- [0003](../.github/decisions/0003-stack-and-container-topology.md) — technology stack and container topology

## Development setup
Expected local setup pattern:
1. Copy `.env.example` to `.env`.
2. Fill in local values for database credentials and service URLs.
3. Start the full stack with Docker or start frontend and backend separately during development.

Typical verification goals:
- frontend is reachable in the browser
- backend responds to a health or status endpoint
- PostgreSQL container is running and reachable from the backend

## Testing strategy
Use layered testing:
- unit tests for validation and utility functions
- integration tests for API endpoints and persistence behavior
- UI tests for important frontend flows once the interface is available

## CI / CD overview
The repository should eventually gate merges on:
- formatting
- linting
- type checks where applicable
- backend tests
- frontend tests
- container build validation

## Security & secrets
- Never commit `.env` with real values.
- Keep `.env.example` free of secrets and sufficient for onboarding.
- Review every new environment variable before adding it to the repository.

## Contributing
Use short, reviewable changes and link related ADRs when a change affects system design. Prefer focused pull requests that touch one concern at a time.

## ADRs & decision log
Record decisions in `.github/decisions/` using one file per decision. The first decision can use the template file `0001-record-architecture-decision.md`.

## Change log
Track only user-visible or architecture-changing updates here. Keep entries concise and dated.

- 2026-06-15 — Initial implementation: Flask CRUD API (recipes, ingredients,
  ordered instructions) with Marshmallow validation and Alembic migrations;
  React + Vite frontend with list/detail/create/edit/delete flows; PostgreSQL;
  Docker Compose for the full stack; backend and frontend test suites.