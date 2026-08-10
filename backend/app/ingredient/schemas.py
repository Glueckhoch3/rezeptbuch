"""Request validation and response serialization for the ingredient domain."""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate


class IngredientInputSchema(Schema):
    """Schema used to validate create and update payloads."""

    class Meta:
        unknown = EXCLUDE

    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=120, error="Name must be between 1 and 120 characters."
        ),
    )
    description = fields.String(load_default=None, allow_none=True)


class IngredientOutputSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    description = fields.String(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


ingredient_input_schema = IngredientInputSchema()
ingredient_output_schema = IngredientOutputSchema()
ingredient_list_output_schema = IngredientOutputSchema(many=True)
