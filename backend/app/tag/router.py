"""HTTP routes for the tag master table, under ``/api/tags``."""

from __future__ import annotations

import uuid

from flask import Blueprint, jsonify, request

from ..core.errors import ApiError
from ..core.extensions import limiter
from ..core.pagination import parse_pagination_params
from . import service
from .schemas import tag_input_schema, tag_list_output_schema, tag_output_schema

tag_bp = Blueprint("tag", __name__, url_prefix="/api/tags")


@tag_bp.get("")
def list_tags():
    page, page_size = parse_pagination_params()
    result = service.list_tags(request.args.get("q"), page, page_size)
    result["items"] = tag_list_output_schema.dump(result["items"])
    return jsonify(result), 200


@tag_bp.post("")
@limiter.limit("60/minute")
def create_tag():
    if not request.is_json:
        raise ApiError("Request body must be JSON.", status_code=415)
    data = tag_input_schema.load(request.get_json())
    tag = service.create_tag(data)
    return jsonify(tag_output_schema.dump(tag)), 201


@tag_bp.delete("/<uuid:tag_id>")
@limiter.limit("60/minute")
def delete_tag(tag_id: uuid.UUID):
    service.delete_tag(tag_id)
    return "", 204
