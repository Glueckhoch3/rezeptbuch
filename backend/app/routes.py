"""HTTP routes for recipe CRUD operations.

All recipe endpoints are grouped under the ``/api/recipes`` prefix. Handlers
validate input through the schemas, delegate to the service layer, and
serialize the result.
"""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from . import services
from .errors import ApiError
from .schemas import (
    recipe_input_schema,
    recipe_list_output_schema,
    recipe_output_schema,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _validated_payload() -> dict:
    """Load and validate a JSON recipe payload from the current request."""
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    # raise on invalid input -> handled by the ValidationError handler.
    return recipe_input_schema.load(request.get_json())


@api_bp.get("/recipes")
def list_recipes():
    recipes = services.list_recipes()
    return jsonify(recipe_list_output_schema.dump(recipes)), 200


@api_bp.post("/recipes")
def create_recipe():
    data = _validated_payload()
    recipe = services.create_recipe(data)
    return jsonify(recipe_output_schema.dump(recipe)), 201


@api_bp.get("/recipes/<int:recipe_id>")
def get_recipe(recipe_id: int):
    recipe = services.get_recipe(recipe_id)
    return jsonify(recipe_output_schema.dump(recipe)), 200


@api_bp.put("/recipes/<int:recipe_id>")
def update_recipe(recipe_id: int):
    data = _validated_payload()
    recipe = services.update_recipe(recipe_id, data)
    return jsonify(recipe_output_schema.dump(recipe)), 200


@api_bp.delete("/recipes/<int:recipe_id>")
def delete_recipe(recipe_id: int):
    services.delete_recipe(recipe_id)
    return "", 204
