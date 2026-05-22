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

Out of scope for the first implementation phase:
- public internet exposure
- multi-user permission systems
- complex recommendation or shopping features
- external identity provider integration

## Architecture overview
The target deployment uses three containers:
- frontend container for the React app
- backend container for the Flask API
- database container for PostgreSQL

The frontend talks to the backend over HTTP. The backend owns validation, persistence rules, and API shape. The database stores recipe data and related records.

When the implementation is available, the architecture should be described here with a simple diagram and the main request flow for:
- list recipes
- create recipe
- update recipe
- delete recipe

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

## Implementation decisions to record in ADRs
Use ADRs for decisions that affect the long-term shape of the system, such as:
- API route structure
- data model normalization
- migration strategy
- Docker composition and networking
- validation libraries
- frontend state management strategy

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