"""Request validation and response serialization for the recipe domain."""

from __future__ import annotations

from marshmallow import (
    EXCLUDE,
    Schema,
    ValidationError,
    fields,
    validate,
    validates_schema,
)

from ..allergen.schemas import AllergenRefSchema
from ..workstep.schemas import WorkstepInputSchema, WorkstepOutputSchema


class RecipeIngredientInputSchema(Schema):
    """One ingredient line: either an existing ingredient_id or a bare name."""

    class Meta:
        unknown = EXCLUDE

    ingredient_id = fields.UUID(load_default=None, allow_none=True)
    name = fields.String(load_default=None, allow_none=True)
    amount = fields.String(
        load_default="", validate=validate.Length(max=50), allow_none=False
    )
    unit = fields.String(
        load_default="", validate=validate.Length(max=31), allow_none=False
    )

    @validates_schema
    def validate_ingredient_reference(self, data, **kwargs):
        if not data.get("ingredient_id") and not (data.get("name") or "").strip():
            raise ValidationError(
                "Either ingredient_id or name is required.", field_name="ingredient_id"
            )


class RecipeIngredientOutputSchema(Schema):
    ingredient_id = fields.UUID()
    name = fields.String(attribute="ingredient.name")
    amount = fields.String()
    unit = fields.String()
    position = fields.Integer()
    allergens = fields.List(
        fields.Nested(AllergenRefSchema), attribute="ingredient.ingredient_allergens"
    )


class RecipeTagOutputSchema(Schema):
    id = fields.UUID(attribute="tag.id")
    name = fields.String(attribute="tag.name")


class RecipeInputSchema(Schema):
    """Schema used to validate create payloads (``POST``); all fields required."""

    class Meta:
        unknown = EXCLUDE

    title = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=255, error="Title must be between 1 and 255 characters."
        ),
    )
    description = fields.String(load_default="", validate=validate.Length(max=2000))
    origin = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=255)
    )
    tags = fields.List(
        fields.String(validate=validate.Length(min=1, max=63)), load_default=list
    )
    ingredients = fields.List(
        fields.Nested(RecipeIngredientInputSchema),
        load_default=list,
        validate=validate.Length(min=1, error="At least one ingredient is required."),
    )
    worksteps = fields.List(
        fields.Nested(WorkstepInputSchema),
        load_default=list,
        validate=validate.Length(min=1, error="At least one workstep is required."),
    )


class RecipePatchSchema(Schema):
    """Schema used to validate ``PATCH`` payloads: every field is optional.

    Collections are still replaced wholesale when present — "present" is
    collection-level, not element-level. Omitted fields are left untouched.
    """

    class Meta:
        unknown = EXCLUDE

    title = fields.String(
        validate=validate.Length(
            min=1, max=255, error="Title must be between 1 and 255 characters."
        )
    )
    description = fields.String(validate=validate.Length(max=2000))
    origin = fields.String(allow_none=True, validate=validate.Length(max=255))
    tags = fields.List(fields.String(validate=validate.Length(min=1, max=63)))
    ingredients = fields.List(
        fields.Nested(RecipeIngredientInputSchema),
        validate=validate.Length(min=1, error="At least one ingredient is required."),
    )
    worksteps = fields.List(
        fields.Nested(WorkstepInputSchema),
        validate=validate.Length(min=1, error="At least one workstep is required."),
    )


class RecipeOutputSchema(Schema):
    """Schema used to serialize a recipe in API responses."""

    id = fields.UUID()
    title = fields.String()
    description = fields.String()
    origin = fields.String(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    worksteps = fields.List(fields.Nested(WorkstepOutputSchema))
    ingredients = fields.List(
        fields.Nested(RecipeIngredientOutputSchema), attribute="recipe_ingredients"
    )
    tags = fields.List(fields.Nested(RecipeTagOutputSchema), attribute="recipe_tags")


recipe_input_schema = RecipeInputSchema()
recipe_patch_schema = RecipePatchSchema()
recipe_output_schema = RecipeOutputSchema()
recipe_list_output_schema = RecipeOutputSchema(many=True)
