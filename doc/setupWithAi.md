<!--
SetupGuide.md
Detailed guideline prompt to help maintainers create project-wide AI instructions and documentation.
Use this as a template prompt when working with an LLM to generate or refine repository instructions.
-->

# AI-guided Setup & Documentation Creation Guide

Purpose: step-by-step prompt + checklist you can feed to an AI assistant (or follow manually) to produce the project instructions, service-level docs, ADRs and developer setup.

## How to use
- Provide the AI with the repository root and the `doc/resources/project_instruction_framework.svg` as the structural guideline.
- Run iteratively: produce a skeleton, review, then ask the AI to flesh out each section.
- Keep outputs small and review often — do not accept large merges without human review.

## Prompt template (use with your AI assistant)

System: You are a technical documentation engineer. Produce clear, actionable repository-level documentation and per-service instruction files. Focus on developer onboarding, coding rules, safety/supply chain, and ADR recording. Use the provided project instruction framework as the canonical structure.

User: I will provide a repository and a high-level project instruction framework diagram (doc/resources/project_instruction_framework.svg). Produce the following artifacts as Markdown files:

1) A top-level project instruction file at `.github/instructions/projectInstructions.md` that includes: scope, safety & security rules, coding principles, documentation usage for AI, ADR guidance, and a skeleton of basic documentation headings.

2) Per-service instruction templates for `frontend/.github/instructions.md` and `backend/.github/instructions.md` containing stack, local setup, folder conventions, testing, build and CI commands.

3) A documentation skeleton file (e.g., `DOCS.md`) with the following headings pre-filled and short guidance under each: Project identity & goals, Quick start, Dev setup, Architecture overview, Services, Domain models & API contracts, Testing, CI/CD, Security, Deployment, Contributing, ADRs.

4) A short ADR template file and a recommended location `.github/decisions/0001-record-architecture-decision.md`.

Constraints and safety checks:
- Do not include secrets, credentials, or private tokens in outputs.
- For each command provided, include the expected result and how to verify success.
- For any AI-generated code or infra changes, add explicit review steps and a human gate.

Output format: return a list of file paths and the contents for each file in valid Markdown. Use code blocks for command examples.

---

## Step-by-step checklist (manual or AI-driven)

1. Gather repo metadata: languages, package managers, frameworks, CI provider.
2. Generate a top-level `projectInstructions.md` skeleton from the template above.
3. Create `frontend/.github/instructions.md` and `backend/.github/instructions.md` using the service checklist.
4. Create `DOCS.md` or expand `README.md` with the documentation headings and minimal content.
5. Create an ADR folder `.github/decisions/` and add the ADR template `0001-record-architecture-decision.md`.
6. Add linting, formatting, and test commands into the docs and CI examples.
7. Review with team: request one or two reviewers to validate safety and correctness.

## Per-service checklist (copy into service-level instruction files)
- Stack & Runtime: primary language, runtime versions, and key frameworks.
- Local setup: commands to install dependencies, env files required, database migrations and seed scripts, how to run locally.
- Folder roles: list major folders and responsibilities (components, services, modules).
- Testing: unit test command, integration test command, sample test file pattern.
- Build & deploy: build command, Dockerfile presence, CI job names that build/publish artifacts.
- Security & secrets: list env vars needed and where to configure secrets (do not include values).

## Sample commands section (replace with project-specific commands)

Front-end example:

```bash
# install
npm ci
# run dev
npm run dev
# unit tests
npm test
```

Back-end example (generic):

```bash
# create venv (python example)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run dev
./scripts/run_dev.sh
# unit tests
pytest
```

## ADR template (example)

```md
Title: 0001 — Short decision title
Date: 2026-05-14
Status: Proposed / Accepted / Deprecated

Context
--------
Describe the problem and the alternatives considered.

Decision
--------
State the decision clearly.

Consequences
------------
List the consequences and next steps.
```

## Review & next steps
- After generating files, run CI locally or in a feature branch to validate linting and tests.
- Add PR templates or commit hooks if helpful (pre-commit, husky, etc.).
- Schedule a short onboarding review to walk the team through the new docs.

## Checklist for acceptance
- Top-level `.github/instructions/projectInstructions.md` exists and covers required sections.
- `frontend/.github/instructions.md` and `backend/.github/instructions.md` created with runnable commands.
- `DOCS.md` or README updated with the basic headings.
- At least one ADR file exists in `.github/decisions/`.
- CI examples or commands are present in docs and validated by a CI run.