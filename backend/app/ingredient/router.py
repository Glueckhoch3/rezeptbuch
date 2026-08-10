"""HTTP routes for the ingredient master table, under ``/api/ingredients``."""

from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request

from ..core.errors import ApiError
from ..core.extensions import limiter
from ..core.pagination import parse_pagination_params
from . import service
from .schemas import (
    ingredient_input_schema,
    ingredient_list_output_schema,
    ingredient_output_schema,
)

ingredient_bp = Blueprint("ingredient", __name__, url_prefix="/api/ingredients")


def _validated_payload() -> dict:
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    return ingredient_input_schema.load(request.get_json())


@ingredient_bp.get("")
def list_ingredients():
    page, page_size = parse_pagination_params()
    result = service.list_ingredients(request.args.get("q"), page, page_size)
    result["items"] = ingredient_list_output_schema.dump(result["items"])
    return jsonify(result), 200


@ingredient_bp.post("")
@limiter.limit("60/minute")
def create_ingredient():
    data = _validated_payload()
    ingredient = service.create_ingredient(data)
    return jsonify(ingredient_output_schema.dump(ingredient)), 201


@ingredient_bp.get("/<uuid:ingredient_id>")
def get_ingredient(ingredient_id: uuid.UUID):
    ingredient = service.get_ingredient(ingredient_id)
    return jsonify(ingredient_output_schema.dump(ingredient)), 200


@ingredient_bp.put("/<uuid:ingredient_id>")
@limiter.limit("60/minute")
def update_ingredient(ingredient_id: uuid.UUID):
    data = _validated_payload()
    ingredient = service.update_ingredient(ingredient_id, data)
    return jsonify(ingredient_output_schema.dump(ingredient)), 200


@ingredient_bp.delete("/<uuid:ingredient_id>")
@limiter.limit("60/minute")
def delete_ingredient(ingredient_id: uuid.UUID):
    service.delete_ingredient(ingredient_id)
    return "", 204
