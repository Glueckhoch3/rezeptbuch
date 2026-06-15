"""Unit tests for the recipe validation schema."""

from __future__ import annotations

import pytest
from marshmallow import ValidationError

from app.schemas import recipe_input_schema


def test_valid_payload_loads(sample_payload):
    data = recipe_input_schema.load(sample_payload)
    assert data["title"] == "Test Soup"
    assert len(data["ingredients"]) == 2
    assert len(data["instructions"]) == 2


def test_missing_title_is_rejected(sample_payload):
    sample_payload.pop("title")
    with pytest.raises(ValidationError) as exc:
        recipe_input_schema.load(sample_payload)
    assert "title" in exc.value.messages


def test_empty_ingredients_is_rejected(sample_payload):
    sample_payload["ingredients"] = []
    with pytest.raises(ValidationError) as exc:
        recipe_input_schema.load(sample_payload)
    assert "ingredients" in exc.value.messages


def test_empty_instructions_is_rejected(sample_payload):
    sample_payload["instructions"] = []
    with pytest.raises(ValidationError) as exc:
        recipe_input_schema.load(sample_payload)
    assert "instructions" in exc.value.messages


def test_ingredient_requires_name(sample_payload):
    sample_payload["ingredients"] = [{"amount": "1", "unit": "kg"}]
    with pytest.raises(ValidationError):
        recipe_input_schema.load(sample_payload)
