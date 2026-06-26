# rezeptbuch

`rezeptbuch` is a local-network recipe hub. Users can create, edit, browse, and
delete recipes from a browser. Each recipe has a title, a description, a list of
ingredients (`amount`, `unit`, `name`), and an ordered list of work instructions.

Stack: **React** (Vite + TypeScript) frontend · **Flask** API backend ·
**PostgreSQL** database — each running in its own container.

> Course context: verteilte-systeme-hse10.

## Docker Hub images

| Service  | Image                                       |
| -------- | ------------------------------------------- |
| Frontend | `glueckhoch3/glueckhoch3:rezeptbuch-frnt-v1` |
| Backend  | `glueckhoch3/glueckhoch3:rezeptbuch-back-v1` |

## Quick start (Docker)

Prerequisites: Docker and Docker Compose. (If Docker requires `sudo` on your
machine, prefix the commands below with `sudo`.)

```bash
# 1. Configure environment
cp .env.example .env
# edit .env and set POSTGRES_PASSWORD and BACKEND_SECRET_KEY

# 2. Build and start the full stack
docker compose up --build -d

# 3. (Optional) load example recipes
docker compose exec backend flask --app wsgi seed
```

Then open:

| Service          | URL                                   | Expected result                 |
| ---------------- | ------------------------------------- | ------------------------------- |
| Frontend         | <http://localhost:8080>               | Recipe list UI loads            |
| Backend health   | <http://localhost:5000/api/health>    | `{"status": "ok"}`              |
| Recipes API      | <http://localhost:5000/api/recipes>   | JSON array of recipes           |

Stop the stack with `docker compose down` (add `-v` to also drop the database
volume).

## Local development (without Docker)

You can run each service directly for a faster feedback loop.

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

# Point at a local database, or use SQLite for a quick start:
export DATABASE_URL="sqlite:///dev.db"
flask --app wsgi db upgrade      # apply migrations
flask --app wsgi seed            # optional sample data
flask --app wsgi run --debug     # serves http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # serves http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` (override with
`VITE_API_PROXY_TARGET`), so the frontend and backend share one origin in the
browser.

## Project layout

```
.
├── backend/            Flask API (app factory, models, schemas, services, routes)
│   ├── app/            application package
│   ├── migrations/     Alembic / Flask-Migrate schema migrations
│   └── tests/          pytest unit + integration tests
├── frontend/           React + Vite + TypeScript single-page app
│   └── src/
│       ├── api/        HTTP client layer
│       ├── components/ reusable UI (form, dialog, error banner)
│       └── pages/      list / detail / create / edit screens
├── doc/                project documentation, API spec, implementation plan
├── .github/decisions/  architecture decision records (ADRs)
├── docker-compose.yml  full-stack orchestration
└── .env.example        documented environment variables
```

## Testing & quality

| Area     | Command (from the service folder)              | What it covers                         |
| -------- | ---------------------------------------------- | -------------------------------------- |
| Backend  | `pytest`                                       | validation unit tests + API integration |
| Backend  | `black --check app tests` / `flake8 app tests` | formatting + linting                   |
| Frontend | `npm test`                                     | API client + form component tests      |
| Frontend | `npm run lint` / `npm run format:check`        | ESLint + Prettier                      |
| Frontend | `npm run build`                                | type-check + production build          |

## Documentation

- [doc/documentation.md](doc/documentation.md) — scope, boundaries, architecture
- [doc/api-doc.yaml](doc/api-doc.yaml) — OpenAPI specification of the REST API
- [doc/implementation-plan.md](doc/implementation-plan.md) — working plan
- [.github/decisions/](.github/decisions/) — architecture decision records

## Security & secrets

- `.env` is git-ignored; never commit real credentials. Keep `.env.example`
  free of secrets.
- Database credentials and the Flask secret key are read from the environment
  only — they are never hardcoded.
- All recipe validation lives in the backend; the frontend only adds basic
  pre-submit checks for a better user experience.
