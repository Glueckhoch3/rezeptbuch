# Frontend Instructions

## Scope
This file applies to the React frontend only.

## Stack and runtime
- React-based user interface
- use the repository-standard package manager and scripts once the app is initialized
- keep browser-facing configuration in the root `.env` and document required variables in `.env.example`

## Frontend responsibilities
- render the recipe list, detail view, create form, edit form, and delete confirmation flow
- keep presentation logic and UI state in the frontend
- call backend endpoints through a dedicated API client layer
- avoid putting persistence or business rules into components

## Folder conventions
- `src/components`: reusable UI building blocks
- `src/pages` or `src/routes`: page-level screens and route wiring
- `src/services` or `src/api`: HTTP clients and backend adapters
- `src/hooks`: shared React hooks
- `src/styles`: design tokens, global styles, and theme rules

## Local setup
1. copy the repository `.env.example` to `.env` when frontend-specific values are required
2. install dependencies with the project package manager
3. start the frontend in development mode

Expected result:
- the app opens in the browser and loads recipe data from the backend

Verification:
- navigation works between list and detail views
- create and edit forms submit against the backend

## Testing
- add component and page tests for critical flows
- mock backend calls at the API client boundary
- cover validation and error rendering paths

## Build and quality gates
- run linting before committing
- run frontend tests in CI
- ensure build output is production-ready before merge

## Security and secrets
- never hardcode backend URLs, credentials, or tokens
- read runtime settings from environment variables only
- do not store secrets in frontend code or local fixtures

## Collaboration rules
- keep component changes focused and reviewable
- prefer small PRs that touch one feature or one screen at a time
- link ADRs when a frontend pattern or dependency choice has long-term impact