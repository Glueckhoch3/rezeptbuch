"""Centralized error handling for consistent, human-readable API responses.

Every error returns the same JSON shape so the frontend can render messages
uniformly::

    {"error": "<short message>", "details": {<field>: [<messages>]}}
"""

from __future__ import annotations

from flask import Flask, jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Application error carrying an HTTP status code and a message."""

    def __init__(self, message: str, status_code: int = 400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(exc: ApiError):
        return jsonify({"error": exc.message, "details": exc.details}), exc.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(exc: ValidationError):
        return (
            jsonify({"error": "Validation failed.", "details": exc.messages}),
            422,
        )

    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        return (
            jsonify({"error": exc.description, "details": {}}),
            exc.code or 500,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        app.logger.exception("Unhandled error: %s", exc)
        return (
            jsonify({"error": "An unexpected error occurred.", "details": {}}),
            500,
        )
