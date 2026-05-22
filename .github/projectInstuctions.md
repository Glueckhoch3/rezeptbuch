---
name: projectInstuctions
description: "Use when: project-wide decisions, contribution rules, code style, and PR guidance."
applyTo: "**"
visibility: public
---

# Project Instructions

Purpose: central project-wide rules and guidance that apply to all services, modules and contributors. Use this file as the top-level source of truth and keep it concise. Service-specific instructions live in `frontend/.github/instructions.md` and `backend/.github/instructions.md`.

## Reference
- Project structure guideline: `doc/resources/recipeRepoStructure.svg` when available.
- Repository documentation entry point: `doc/documentation.md`.
- Implementation plan: `doc/implementation-plan.md`.

## Scope
- Project-wide: policies that apply to every repository area (git flow, secrets, ADRs)
- Service-level: frontend/backend instructions under each service folder
- Domain-level: module- or bounded-context instructions next to modules (e.g., `modules/ShoppingCart/.github/instructions.md`)

## Project Context
- Project name: rezeptbuch
- Goal: provide a local-network hub for recipes that users can add, edit, remove, and browse.
- Core data model: recipe title, description, ingredients as `[amount, unit, name]`, and ordered work instructions.
- Target stack: React frontend, Flask backend, PostgreSQL database in Docker.
- Runtime layout target: frontend, backend, and database run in separate containers with shared configuration.
- Configuration model: keep environment variables centralized in a repository-root `.env` file and document the required keys in `.env.example`.

## Safety & Security
- Never commit secrets, credentials, or PII to the repository. Use encrypted secret stores (GitHub Secrets, Vault, etc.).
- Validate third-party model providers and monitor usage/costs. Vet models for safety and data retention policies.
- When using AI to generate code or documentation, verify outputs for sensitive data leaks and correctness before merging.
- Limit AI automation that can perform destructive actions; require human approvals for infra changes and secret rotations.
- Treat `.env` as local-only input. Keep `.env.example` checked in and free of secret values.
- Do not hardcode database credentials, API keys, or internal hostnames into frontend or backend code.

## Basic Coding Principles
- Small, reviewable changes: keep PRs focused and < 400 lines where possible.
- Tests: every new feature must include unit tests; critical flows require integration tests.
- Linters & formatters: enable and run automatically in CI (e.g., ESLint, Prettier, Flake8, Black, rubocop, etc.).
- Type safety: enable static typing where applicable (TypeScript, MyPy, etc.).
- Dependency management: pin direct dependencies and review transitive updates.
- Error handling: prefer explicit failures with clear messages; do not silently swallow exceptions.
- Prefer predictable APIs and explicit request/response contracts over implicit behavior.
- Keep recipe, ingredient, and instruction validation in the backend, and keep the frontend focused on presentation and user interaction.

## Documentation Usage (for humans and AI)
- Keep docs single-sourced and concise. Prefer small, focused files per concern.
- When using AI to author docs:
  - Provide the AI with the project skeleton and ADRs as context.
  - Ask for structured outputs (Markdown headings, checklists, code snippets).
  - Always review and test AI-generated commands before executing.
- Documentation priorities:
  1. Getting started / development setup
  2. Architecture overview and high-level data flows
  3. Service-level instructions (tooling, stack, conventions)
  4. Domain-level contracts (entity definitions, API specs)

## Documentation Baseline
- Keep `doc/documentation.md` as the project-facing overview for scope, boundaries, and major decisions.
- Keep `doc/implementation-plan.md` as the working plan for frontend and backend implementation tasks.
- Use ADRs for decisions with lasting impact, such as authentication approach, API versioning, Docker topology, or schema evolution.
- Link ADRs from the overview documentation when a decision affects contributors or future implementation work.

## Architectural Decisions (ADRs)
- Record important design choices in `.github/decisions/` using ADR style files (one decision per file). Each ADR should include context, decision, consequences, and date.
- Link ADRs from relevant instructions and the architecture overview.
- Prefer a short numbered filename such as `0001-record-architecture-decision.md` for the first decision.

## Basic Documentation Headings (skeleton)
Create a top-level documentation file (e.g., `DOCS.md` or expand `README.md`) and include these headings to start — fill them out iteratively:
- Project identity & goals
- Quick start (clone, prerequisites, dev run)
- Development setup (per-service local setup)
- Architecture overview (diagram + narrative)
- Services (frontend, backend) — each with: stack, conventions, start script, test commands
- Domain models & API contracts
- Testing strategy (unit / integration / e2e)
- CI / CD overview
- Security & secrets
- Deployment & environments
- Contributing guide & PR conventions
- ADRs & decision log
- Change log
- For each command referenced in docs, include the expected result and a quick verification step.

## Service-level instruction checklist (frontend/backend)
- Describe stack, major dependencies and versions.
- Provide local setup steps (install, environment, migrations, seed data).
- Define folder roles and conventions (components, pages, services, modules).
- Testing: recommended frameworks, commands, sample tests.
- Build and release steps used by CI.
- Frontend instructions should cover component structure, API client placement, form handling, and UI state boundaries.
- Backend instructions should cover route organization, request validation, persistence, migrations, and serialization.

## Development setup guidance (high-level)
- Provide explicit commands and expected outcomes for local setup; include containerized instructions (Docker) if supported.
- Specify required environment variables and how to obtain them (do not include secrets in repo).
- Recommend virtualization/manager instructions (nvm, pyenv, node, poetry, docker-compose).
- Prefer one command to start each service locally and one command to start the full stack with Docker.

## Cross-cutting rules
- Branching & PR: feature branches, descriptive titles, link ADRs or tickets, request at least one reviewer.
- Commit messages: use conventional commits or a short imperative style.
- CI gating: require passing tests, linting, and types.
- Protect the repository root `.env.example` from drift by reviewing it whenever environment variables change.

## Where to add service or module-specific instructions
- Add `frontend/.github/instructions.md`, `backend/.github/instructions.md` and `modules/<name>/.github/instructions.md` with focused guidance mirroring this top-level file but scoped to the module.

## Review cadence
- Keep the top-level instruction file lightweight. Review and update every major release or when architectural changes occur.