"""Pytest fixtures: an app bound to an in-memory SQLite database."""

from __future__ import annotations

import pytest

from app import create_app
from app.config import TestConfig
from app.extensions import db


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
        "ingredients": [
            {"amount": "1", "unit": "l", "name": "Vegetable stock"},
            {"amount": "2", "unit": "", "name": "Carrots"},
        ],
        "instructions": [
            {"text": "Chop the carrots."},
            {"text": "Simmer in the stock for 20 minutes."},
        ],
    }
