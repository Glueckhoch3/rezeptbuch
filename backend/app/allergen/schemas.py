"""Request validation and response serialization for the allergen domain."""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate


class AllergenInputSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=63, error="Name must be between 1 and 63 characters."
        ),
    )


class AllergenOutputSchema(Schema):
    id = fields.UUID()
    name = fields.String()


class AllergenRefSchema(Schema):
    """Allergen reference nested under an ``IngredientAllergen`` link row."""

    id = fields.UUID(attribute="allergen.id")
    name = fields.String(attribute="allergen.name")


allergen_input_schema = AllergenInputSchema()
allergen_output_schema = AllergenOutputSchema()
allergen_list_output_schema = AllergenOutputSchema(many=True)
