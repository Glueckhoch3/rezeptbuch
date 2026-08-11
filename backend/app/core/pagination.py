"""Shared pagination helpers used by every domain's list endpoint.

Every paginated list response uses the same envelope:
``{"items": [...], "page": n, "page_size": n, "total": n}``.
"""

from __future__ import annotations

from flask import request
from sqlalchemy.orm import Query

from .errors import ApiError

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def parse_pagination_params() -> tuple[int, int]:
    """Read and validate ``page``/``page_size`` query params from the request."""
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", DEFAULT_PAGE_SIZE))
    except ValueError:
        raise ApiError("page and page_size must be integers.", status_code=400)

    if page < 1:
        raise ApiError("page must be 1 or greater.", status_code=400)
    if page_size < 1 or page_size > MAX_PAGE_SIZE:
        raise ApiError(
            f"page_size must be between 1 and {MAX_PAGE_SIZE}.", status_code=400
        )
    return page, page_size


def paginate(query: Query, page: int, page_size: int) -> dict:
    """Slice a SQLAlchemy query and wrap the result in the pagination envelope."""
    total = query.order_by(None).count()
    items = query.limit(page_size).offset((page - 1) * page_size).all()
    return {"items": items, "page": page, "page_size": page_size, "total": total}
