"""Request validation and response serialization with Marshmallow.

Validation rules live here (and in the service layer) rather than in the
frontend, keeping the backend the single source of truth for recipe shape.
"""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate


class IngredientSchema(Schema):
    """One ingredient line: amount, unit, name."""

    class Meta:
        unknown = EXCLUDE

    amount = fields.String(
        load_default="", validate=validate.Length(max=50), allow_none=False
    )
    unit = fields.String(
        load_default="", validate=validate.Length(max=50), allow_none=False
    )
    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1,
            max=200,
            error="Ingredient name must be between 1 and 200 characters.",
        ),
    )


class InstructionSchema(Schema):
    """One ordered work instruction step."""

    class Meta:
        unknown = EXCLUDE

    text = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Instruction text is required."),
    )


class RecipeInputSchema(Schema):
    """Schema used to validate create and update payloads."""

    class Meta:
        unknown = EXCLUDE

    title = fields.String(
        required=True,
        validate=validate.Length(min=1, max=200, error="Title is required."),
    )
    description = fields.String(load_default="")
    ingredients = fields.List(
        fields.Nested(IngredientSchema),
        load_default=list,
        validate=validate.Length(min=1, error="At least one ingredient is required."),
    )
    instructions = fields.List(
        fields.Nested(InstructionSchema),
        load_default=list,
        validate=validate.Length(min=1, error="At least one instruction is required."),
    )


class IngredientOutputSchema(Schema):
    amount = fields.String()
    unit = fields.String()
    name = fields.String()
    position = fields.Integer()


class InstructionOutputSchema(Schema):
    step_number = fields.Integer()
    text = fields.String()


class RecipeOutputSchema(Schema):
    """Schema used to serialize a recipe in API responses."""

    id = fields.Integer()
    title = fields.String()
    description = fields.String()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    ingredients = fields.List(fields.Nested(IngredientOutputSchema))
    instructions = fields.List(fields.Nested(InstructionOutputSchema))


recipe_input_schema = RecipeInputSchema()
recipe_output_schema = RecipeOutputSchema()
recipe_list_output_schema = RecipeOutputSchema(many=True)
