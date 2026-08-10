"""Unit tests for ingredient.service business logic."""

from __future__ import annotations

from app.ingredient import service


def test_resolve_or_create_by_name_creates_once(app):
    with app.app_context():
        first = service.resolve_or_create_by_name("Sugar")
        second = service.resolve_or_create_by_name("sugar")
        assert first.id == second.id
