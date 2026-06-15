# 0003 - Technology stack and container topology

Date: 2026-06-15
Status: Accepted

## Context
The implementation plan and project instructions fix the high-level stack
(React frontend, Flask backend, PostgreSQL in Docker) but leave the concrete
libraries, tooling, and container wiring to be confirmed during implementation.

## Decision
Confirm the following choices:

Backend
- Flask application factory pattern (`create_app`) with blueprints for routes.
- SQLAlchemy ORM via Flask-SQLAlchemy; Flask-Migrate (Alembic) for migrations.
- Marshmallow for request validation and response serialization.
- gunicorn as the production WSGI server; pytest, black, and flake8 for quality.
- Tests run against in-memory SQLite for speed and isolation; PostgreSQL is the
  runtime database. Models use only portable column types so both work.

Frontend
- React with Vite and TypeScript; React Router for routing.
- A dedicated `src/api` client layer (native `fetch`) — no component calls the
  network directly. ESLint, Prettier, and Vitest + Testing Library for quality.

Container topology
- Three containers: `db` (postgres:16), `backend` (gunicorn), `frontend`
  (multi-stage build served by nginx).
- nginx serves the built SPA and proxies `/api` to the backend, so the browser
  uses a single origin in production.
- All configuration comes from a root `.env` file (documented in
  `.env.example`); the backend waits for the database and applies migrations on
  startup via `entrypoint.sh`.

## Consequences
- Single-origin setup avoids CORS issues in production; CORS is still enabled
  and configurable for the Vite dev server (different port).
- Migrations are applied automatically on container start, so the database
  schema is always current after `docker compose up`.
- Using SQLite for tests means PostgreSQL-specific features must be avoided in
  the models; this is acceptable for the current schema.

## Alternatives considered
- Create React App / Next.js instead of Vite: heavier than needed for a small
  SPA.
- Raw SQL or another ORM (Peewee): SQLAlchemy + Flask-Migrate is the most
  common, well-supported Flask combination.
- Serving the frontend from Flask: keeping a separate nginx container matches
  the "separate containers" runtime target in the project instructions.

## References
- `doc/implementation-plan.md`, `doc/documentation.md`
- `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`,
  `frontend/nginx.conf`
