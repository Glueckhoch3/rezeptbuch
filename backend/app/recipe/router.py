"""HTTP routes for recipe CRUD operations, under ``/api/recipes``."""

from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request

from ..core.errors import ApiError
from ..core.extensions import limiter
from ..core.pagination import parse_pagination_params
from . import service
from .schemas import (
    recipe_input_schema,
    recipe_list_output_schema,
    recipe_output_schema,
    recipe_patch_schema,
)

recipe_bp = Blueprint("recipe", __name__, url_prefix="/api/recipes")


def _validated_create_payload() -> dict:
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    return recipe_input_schema.load(request.get_json())


def _validated_patch_payload() -> dict:
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    return recipe_patch_schema.load(request.get_json())


@recipe_bp.get("")
def list_recipes():
    page, page_size = parse_pagination_params()
    result = service.list_recipes(page, page_size)
    result["items"] = recipe_list_output_schema.dump(result["items"])
    return jsonify(result), 200


@recipe_bp.post("")
@limiter.limit("60/minute")
def create_recipe():
    data = _validated_create_payload()
    recipe = service.create_recipe(data)
    return jsonify(recipe_output_schema.dump(recipe)), 201


@recipe_bp.get("/<uuid:recipe_id>")
def get_recipe(recipe_id: uuid.UUID):
    recipe = service.get_recipe(recipe_id)
    return jsonify(recipe_output_schema.dump(recipe)), 200


@recipe_bp.patch("/<uuid:recipe_id>")
@limiter.limit("60/minute")
def update_recipe(recipe_id: uuid.UUID):
    data = _validated_patch_payload()
    recipe = service.update_recipe(recipe_id, data)
    return jsonify(recipe_output_schema.dump(recipe)), 200


@recipe_bp.delete("/<uuid:recipe_id>")
@limiter.limit("60/minute")
def delete_recipe(recipe_id: uuid.UUID):
    service.delete_recipe(recipe_id)
    return "", 204
