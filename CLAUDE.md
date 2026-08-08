# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`rezeptbuch` is a local-network recipe hub (course context: verteilte-systeme-hse10). A recipe has a title, description, an ordered list of ingredients (`amount`, `unit`, `name`), and an ordered list of work instructions. Stack: **React** (Vite + TypeScript) frontend, **Flask** API backend, **PostgreSQL** database, each in its own container.

## Commands

### Backend (from `backend/`)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

export DATABASE_URL="sqlite:///dev.db"   # or point at Postgres
flask --app wsgi db upgrade              # apply migrations
flask --app wsgi seed                    # optional sample data
flask --app wsgi run --debug             # http://localhost:5000

pytest                                   # run all tests
pytest tests/test_api.py::test_name -q   # run a single test
black --check app tests                  # formatting
flake8 app tests                         # linting
```

### Frontend (from `frontend/`)

```bash
npm install
npm run dev              # http://localhost:5173, proxies /api to the backend
npm test                 # vitest run (all tests)
npx vitest run src/components/RecipeForm.test.tsx   # single test file
npm run lint             # ESLint
npm run format:check     # Prettier
npm run build            # tsc --noEmit + production build
```

### Full stack (Docker, from repo root)

```bash
cp .env.example .env     # set POSTGRES_PASSWORD and BACKEND_SECRET_KEY
docker compose up --build -d
docker compose exec backend flask --app wsgi seed   # optional sample data
```
Frontend at `http://localhost:8080`, backend health check at `http://localhost:5000/api/health`.

## Git hooks

One-time setup after cloning (requires the backend venv active and `npm install` run in `frontend/`):

```bash
pip install -r backend/requirements-dev.txt   # provides pre-commit
pre-commit install                            # installs pre-commit + pre-push hooks
```

- `pre-commit` stage: `black --check`, `flake8` (backend), `eslint`, `prettier --check` (frontend) — scoped to staged files, skipped when not relevant.
- `pre-push` stage: `pytest` (backend), `npm test`, `tsc --noEmit` (frontend) — full suites, always run on push. (Not `npm run build`: `frontend/dist/` is committed, and a full build would rewrite its hashed filenames on every push.)
- Bypass in an emergency with `git commit --no-verify` / `git push --no-verify`; fix and re-run normally afterward.

## Architecture

**Backend** (`backend/app/`) is a small layered Flask app:
- `__init__.py` — app factory (`create_app`); wires extensions, blueprint, error handlers, `/api/health`.
- `models.py` — SQLAlchemy models: `Recipe` has-many `Ingredient` (ordered by `position`) and `Instruction` (ordered by `step_number`), both cascade-deleted with the parent recipe.
- `schemas.py` — marshmallow schemas for validating/serializing recipe payloads.
- `routes.py` — thin HTTP handlers under `/api/recipes`; validate via schemas, delegate to `services`, serialize the result. No business logic here.
- `services.py` — all business logic (create/read/update/delete). Updates replace the ingredient/instruction collections wholesale rather than diffing them. Amounts are stored as free text (e.g. `"1/2"`, `"a pinch"`), not numbers.
- `errors.py` — every error path (`ApiError`, marshmallow `ValidationError`, HTTP exceptions, unhandled exceptions) is normalized to `{"error": "<message>", "details": {...}}`.
- `config.py` — all runtime config comes from environment variables (`get_config()` picks `TestConfig` — in-memory SQLite — when `FLASK_ENV=test`). `DATABASE_URL` overrides the discrete `POSTGRES_*` vars when set.
- `cli.py` — custom Flask CLI commands (`seed`, `init-db`).

**Frontend** (`frontend/src/`) is a standard Vite/React/TypeScript SPA:
- `api/client.ts` — the only place that calls `fetch`; every backend call goes through this module and normalizes failures into a typed `ApiError`. Components never call `fetch` directly.
- `router.tsx` — route table mapping `/`, `/recipes/new`, `/recipes/:id`, `/recipes/:id/edit` to page components.
- `pages/` — one component per route/screen; own data fetching and page-level state.
- `components/` — reusable UI (form, confirm dialog, error banner) with no direct API calls.
- All recipe validation is authoritative in the backend; the frontend only does basic pre-submit checks for UX.

**Cross-cutting**: environment variables are centralized in a repository-root `.env` (see `.env.example` for the full documented list — Postgres credentials, `BACKEND_SECRET_KEY`, `CORS_ORIGINS`, Vite proxy target, etc.); never hardcode secrets or backend URLs in code.

## Conventions (from `.github/projectInstuctions.md` and service-level instructions.md files)

- Keep routes thin; put business logic in `services.py`, not handlers.
- Keep recipe/ingredient/instruction validation in the backend; the frontend stays focused on presentation.
- Record durable design decisions (API shape, persistence, auth, Docker topology) as an ADR in `.github/decisions/`.
- Service-specific instructions live in `backend/.github/instructions.md` and `frontend/.github/instructions.md` — check those for scope-specific detail before making structural changes to one service.
