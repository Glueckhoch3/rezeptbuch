"""Focused test for the baseline write-endpoint rate limit.

See ``.github/decisions/0005-baseline-rate-limiting.md``. Kept as its own
test rather than asserted redundantly in every domain's test file.
"""

from __future__ import annotations

import pytest

from app.core.extensions import limiter


@pytest.fixture(autouse=True)
def _reset_limiter_storage():
    limiter.reset()
    yield
    limiter.reset()


def test_write_endpoint_returns_429_when_limit_exceeded(client):
    for _ in range(60):
        resp = client.post("/api/tags", json={"name": "unique-tag"})
        assert resp.status_code in (201, 409)

    resp = client.post("/api/tags", json={"name": "one-too-many"})
    assert resp.status_code == 429
    body = resp.get_json()
    assert "error" in body
    assert "details" in body


def test_get_endpoints_are_not_rate_limited(client):
    for _ in range(65):
        resp = client.get("/api/tags")
        assert resp.status_code == 200
