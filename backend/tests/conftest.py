"""Pytest fixtures: an app bound to an in-memory SQLite database."""

from __future__ import annotations

import pytest

from app import create_app
from app.core.config import TestConfig
from app.core.extensions import db


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def sample_payload() -> dict:
    return {
        "title": "Test Soup",
        "description": "A warming soup.",
        "origin": "Testland",
        "tags": ["soup", "warming"],
        "ingredients": [
            {"amount": "1", "unit": "l", "name": "Vegetable stock"},
            {"amount": "2", "unit": "", "name": "Carrots"},
        ],
        "worksteps": [
            {"title": "Chop", "description": "Chop the carrots."},
            {"title": "Simmer", "description": "Simmer in the stock for 20 minutes."},
        ],
    }
