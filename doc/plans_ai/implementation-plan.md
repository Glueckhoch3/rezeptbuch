# rezeptbuch Implementation Plan

## Goal
Deliver a usable recipe management application with a React frontend, a Flask backend, and PostgreSQL in Docker.

## Phase 1: foundation
Frontend:
- create the application shell and routing structure
- define the main screens for list, detail, create, edit, and delete confirmation
- add a service layer for backend API calls
- establish shared form and validation patterns

Backend:
- create the Flask application skeleton
- define route groups for recipe CRUD operations
- add request validation and response serialization
- configure database access and migration support

Infrastructure:
- create a root `.env.example`
- define required environment variables in one place
- add Docker configuration for frontend, backend, and PostgreSQL

## Phase 2: data model and API
Backend data model:
- recipe
- ingredient
- work instruction

Backend functions to plan:
- create recipe
- list recipes
- get recipe by id
- update recipe
- delete recipe
- validate ingredient lists and ordered instructions

Frontend functions to plan:
- fetch recipes
- display recipe list and detail views
- submit create and edit forms
- confirm deletion
- surface backend validation errors clearly

## Phase 3: quality and tooling
Frontend tooling:
- linting
- formatting
- component or UI tests

Backend tooling:
- linting
- formatting
- unit tests
- API integration tests

Shared quality checks:
- container build validation
- environment variable review
- ADR creation for any durable design decision

## Dependencies to confirm during implementation
Frontend:
- React
- router
- HTTP client
- form and validation helper libraries

Backend:
- Flask
- database driver or ORM
- migration tooling
- test framework

Infrastructure:
- Docker and Docker Compose
- PostgreSQL

## Execution order
1. confirm repository layout and package managers
2. implement environment configuration and container setup
3. implement backend CRUD API
4. implement frontend screens against the API
5. add tests and linting
6. record any architecture decisions in ADRs

## Exit criteria
The initial implementation is ready when:
- the app runs end-to-end in containers
- recipes can be added, edited, listed, and removed
- validation errors are visible and understandable
- the repository documents setup, scope, and decisions