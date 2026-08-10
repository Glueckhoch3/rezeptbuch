"""HTTP route for cross-domain recipe search, under ``/api/recipes/search``."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..core.pagination import parse_pagination_params
from ..recipe.schemas import recipe_list_output_schema
from . import service

search_bp = Blueprint("search", __name__, url_prefix="/api/recipes")


@search_bp.get("/search")
def search_recipes():
    page, page_size = parse_pagination_params()
    result = service.search_recipes(
        tag=request.args.get("tag"),
        ingredient=request.args.get("ingredient"),
        allergen=request.args.get("allergen"),
        q=request.args.get("q"),
        page=page,
        page_size=page_size,
    )
    result["items"] = recipe_list_output_schema.dump(result["items"])
    return jsonify(result), 200
