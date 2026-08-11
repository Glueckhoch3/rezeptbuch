# 0005 - Baseline rate limiting on write endpoints

Date: 2026-08-10
Status: Accepted

## Context
`rezeptbuch` is a single shared local-network app with no auth and no
internet exposure by design (see `0003-stack-and-container-topology.md`).
`doc/plans_ai/step2-backend-plan.md` reverses the earlier "out of scope,
local-network-only" stance and adds a baseline rate limit to write endpoints
anyway.

## Decision
Add `Flask-Limiter` and apply a per-route limit of 60 requests/minute, keyed
by remote address, to every `POST`/`PATCH`/`PUT`/`DELETE` endpoint across all
domains (`recipe`, `ingredient`, `tag`, `allergen`). `GET` endpoints and
`/api/health` are exempt — the limit is applied by decorating only the write
route handlers with `@limiter.limit("60/minute")`, not via a blanket app-wide
default.

- **Storage**: in-memory, matching the app's current lack of a Redis/cache
  dependency. This means limits reset on process restart and don't work
  across multiple gunicorn workers — acceptable for this deployment's scale.
- **Response**: `429` is a `werkzeug` `HTTPException`, already normalized by
  the existing `errors.py::handle_http_error` handler to
  `{"error": "<message>", "details": {}}`, so no new error-handling code was
  needed.

This is explicitly a "secure by default" habit, not a response to an
observed threat: a local-network app today can end up reachable more broadly
tomorrow (a misconfigured port-forward, a container exposed by a different
compose file), and the cost of the control is low. It should not be read as
evidence that the deployment's threat model has changed.

## Consequences
- Legitimate bursts of writes (e.g. seeding many recipes in a loop) can hit
  the limit; 60/minute was chosen generously for a trusted local network, not
  tuned against any real abuse pattern.
- In-memory storage means the limit is per-process; if the backend is ever
  scaled to multiple workers/replicas, the effective limit multiplies. This
  is a known, accepted gap at this deployment's current scale — revisit if
  that changes.
- One dedicated test (`backend/tests/test_rate_limit.py`) exercises the
  429 path; it isn't re-asserted in every domain's test file.

## Alternatives considered
- No rate limiting (status quo): rejected per the plan's "secure by default"
  rationale above.
- Redis-backed storage: rejected — would add an operational dependency
  (a cache/session store) this app doesn't otherwise need, for a control
  that isn't defending against a real observed threat.
- App-wide default limit (via `Limiter(default_limits=...)`) instead of
  per-route decorators: rejected — would also throttle `GET` and
  `/api/health`, which the plan explicitly wants exempt.

## References
- `doc/plans_ai/step2-backend-plan.md`
- `backend/app/core/extensions.py` (`limiter`), each domain's `router.py`,
  `backend/tests/test_rate_limit.py`
