<!-- Project-wide instruction template for contributors and AI agents -->
# Project Instructions

Purpose: central project-wide rules and guidance that apply to all services, modules and contributors. Use this file as the top-level source of truth and keep it concise. Service-specific instructions live in `frontend/.github/instructions.md` and `backend/.github/instructions.md` (create if missing).

## Reference
- Project structure guideline: doc/resources/project_instruction_framework.svg

## Scope
- Project-wide: policies that apply to every repository area (git flow, secrets, ADRs)
- Service-level: frontend/backend instructions under each service folder
- Domain-level: module- or bounded-context instructions next to modules (e.g., `modules/ShoppingCart/.github/instructions.md`)

## Safety & Security
- Never commit secrets, credentials, or PII to the repository. Use encrypted secret stores (GitHub Secrets, Vault, etc.).
- Validate third-party model providers and monitor usage/costs. Vet models for safety and data retention policies.
- When using AI to generate code or documentation, verify outputs for sensitive data leaks and correctness before merging.
- Limit AI automation that can perform destructive actions; require human approvals for infra changes and secret rotations.

## Basic Coding Principles
- Small, reviewable changes: keep PRs focused and < 400 lines where possible.
- Tests: every new feature must include unit tests; critical flows require integration tests.
- Linters & formatters: enable and run automatically in CI (e.g., ESLint, Prettier, Flake8, Black, rubocop, etc.).
- Type safety: enable static typing where applicable (TypeScript, MyPy, etc.).
- Dependency management: pin direct dependencies and review transitive updates.
- Error handling: prefer explicit failures with clear messages; do not silently swallow exceptions.

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

## Architectural Decisions (ADRs)
- Record important design choices in `.github/decisions/` using ADR style files (one decision per file). Each ADR should include context, decision, consequences, and date.
- Link ADRs from relevant instructions and the architecture overview.

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

## Service-level instruction checklist (frontend/backend)
- Describe stack, major dependencies and versions.
- Provide local setup steps (install, environment, migrations, seed data).
- Define folder roles and conventions (components, pages, services, modules).
- Testing: recommended frameworks, commands, sample tests.
- Build and release steps used by CI.

## Development setup guidance (high-level)
- Provide explicit commands and expected outcomes for local setup; include containerized instructions (Docker) if supported.
- Specify required environment variables and how to obtain them (do not include secrets in repo).
- Recommend virtualization/manager instructions (nvm, pyenv, node, poetry, docker-compose).

## Cross-cutting rules
- Branching & PR: feature branches, descriptive titles, link ADRs or tickets, request at least one reviewer.
- Commit messages: use conventional commits or a short imperative style.
- CI gating: require passing tests, linting, and types.

## Where to add service or module-specific instructions
- Add `frontend/.github/instructions.md`, `backend/.github/instructions.md` and `modules/<name>/.github/instructions.md` with focused guidance mirroring this top-level file but scoped to the module.

## Review cadence
- Keep the top-level instruction file lightweight. Review and update every major release or when architectural changes occur.