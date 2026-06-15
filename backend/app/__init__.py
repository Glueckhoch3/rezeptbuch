"""Application factory for the rezeptbuch Flask backend."""

from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config, get_config
from .extensions import db, migrate
from .errors import register_error_handlers


def create_app(config: Config | None = None) -> Flask:
    """Create and configure a Flask application instance.

    Args:
        config: Optional configuration object. When omitted the configuration
            is resolved from environment variables via :func:`get_config`.
    """
    app = Flask(__name__)
    app.config.from_object(config or get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Models are imported so that SQLAlchemy and Alembic see the metadata.
    from . import models  # noqa: F401

    from .routes import api_bp

    app.register_blueprint(api_bp)
    register_error_handlers(app)

    @app.get("/api/health")
    def health() -> tuple:
        """Lightweight liveness probe used by Docker and clients."""
        return jsonify({"status": "ok"}), 200

    return app
