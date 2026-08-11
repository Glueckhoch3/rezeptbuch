"""Request validation and response serialization for the tag domain."""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate


class TagInputSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=63, error="Name must be between 1 and 63 characters."
        ),
    )


class TagOutputSchema(Schema):
    id = fields.UUID()
    name = fields.String()


tag_input_schema = TagInputSchema()
tag_output_schema = TagOutputSchema()
tag_list_output_schema = TagOutputSchema(many=True)
