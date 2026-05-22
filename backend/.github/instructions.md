# Backend Instructions

## Scope
This file applies to the Flask backend only.

## Stack and runtime
- Flask API service
- PostgreSQL as the persistence layer
- containerized runtime with shared environment variables from the repository root `.env`

## Backend responsibilities
- expose recipe CRUD endpoints
- validate and normalize recipe, ingredient, and instruction payloads
- persist data consistently
- return stable, human-readable error responses

## Folder conventions
- `app/` or equivalent application package: routes, services, schemas, and persistence code
- `tests/`: unit and integration tests
- `migrations/`: schema migration files
- `docker/` or `deploy/`: container or runtime support files if needed

## Local setup
1. copy `.env.example` to `.env`
2. set database connection settings and backend runtime values
3. start PostgreSQL and the Flask service

Expected result:
- the API starts successfully and can reach the database

Verification:
- a health or status endpoint returns success
- recipe endpoints can read and write test data

## Testing
- write unit tests for validation and service logic
- write integration tests for routes and database interaction
- keep test fixtures small and explicit

## Build and quality gates
- run linting and formatting checks before merge
- run backend tests in CI
- verify migration scripts before changing the schema

## Security and secrets
- never commit database passwords or secret keys
- keep environment values in `.env` and sample values in `.env.example`
- validate inbound payloads before persistence

## Collaboration rules
- prefer explicit service and route boundaries over large monolithic handlers
- keep endpoint behavior backward compatible when possible
- record durable design changes in an ADR when they affect API shape or persistence