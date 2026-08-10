"""HTTP routes for the allergen master table, under ``/api/allergens``."""

from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request

from ..core.errors import ApiError
from ..core.extensions import limiter
from ..core.pagination import parse_pagination_params
from . import service
from .schemas import (
    allergen_input_schema,
    allergen_list_output_schema,
    allergen_output_schema,
)

allergen_bp = Blueprint("allergen", __name__, url_prefix="/api/allergens")


@allergen_bp.get("")
def list_allergens():
    page, page_size = parse_pagination_params()
    result = service.list_allergens(request.args.get("q"), page, page_size)
    result["items"] = allergen_list_output_schema.dump(result["items"])
    return jsonify(result), 200


@allergen_bp.post("")
@limiter.limit("60/minute")
def create_allergen():
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    data = allergen_input_schema.load(request.get_json())
    allergen = service.create_allergen(data)
    return jsonify(allergen_output_schema.dump(allergen)), 201


@allergen_bp.delete("/<uuid:allergen_id>")
@limiter.limit("60/minute")
def delete_allergen(allergen_id: uuid.UUID):
    service.delete_allergen(allergen_id)
    return "", 204
