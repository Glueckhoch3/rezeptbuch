"""Marshmallow schemas for worksteps, nested inside recipe payloads."""

from __future__ import annotations

from marshmallow import EXCLUDE, Schema, fields, validate


class WorkstepInputSchema(Schema):
    """One ordered work instruction step."""

    class Meta:
        unknown = EXCLUDE

    title = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=120, error="Workstep title must be between 1 and 120 characters."
        ),
    )
    description = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Workstep description is required."),
    )


class WorkstepOutputSchema(Schema):
    step_number = fields.Integer()
    title = fields.String()
    description = fields.String()
