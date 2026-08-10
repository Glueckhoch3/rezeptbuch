"""Request validation and response serialization for the ingredient domain."""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate

from ..allergen.schemas import AllergenRefSchema


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


class IngredientAllergensInputSchema(Schema):
    """Schema for replacing an ingredient's allergen links, by allergen name."""

    class Meta:
        unknown = EXCLUDE

    allergens = fields.List(
        fields.String(validate=validate.Length(min=1, max=63)), load_default=list
    )


class IngredientOutputSchema(Schema):
    id = fields.UUID()
    name = fields.String()
    description = fields.String(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    allergens = fields.List(
        fields.Nested(AllergenRefSchema), attribute="ingredient_allergens"
    )


ingredient_input_schema = IngredientInputSchema()
ingredient_allergens_input_schema = IngredientAllergensInputSchema()
ingredient_output_schema = IngredientOutputSchema()
ingredient_list_output_schema = IngredientOutputSchema(many=True)
