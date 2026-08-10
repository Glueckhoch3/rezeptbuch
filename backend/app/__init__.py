"""Application factory for the rezeptbuch Flask backend."""

from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS

from .core.config import Config, get_config
from .core.errors import register_error_handlers
from .core.extensions import db, limiter, migrate


def create_app(config: type[Config] | None = None) -> Flask:
    """Create and configure a Flask application instance.

    Args:
        config: Optional configuration class. When omitted the configuration
            class is resolved from environment variables via :func:`get_config`.
    """
    app = Flask(__name__)
    app.config.from_object(config or get_config())

    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Models are imported so that SQLAlchemy and Alembic see the metadata.
    from .allergen import models as allergen_models  # noqa: F401
    from .ingredient import models as ingredient_models  # noqa: F401
    from .recipe import models as recipe_models  # noqa: F401
    from .recipe_ingredient import models as recipe_ingredient_models  # noqa: F401
    from .tag import models as tag_models  # noqa: F401
    from .workstep import models as workstep_models  # noqa: F401

    from .allergen.router import allergen_bp
    from .ingredient.router import ingredient_bp
    from .recipe.router import recipe_bp
    from .search.router import search_bp
    from .tag.router import tag_bp

    app.register_blueprint(recipe_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(ingredient_bp)
    app.register_blueprint(tag_bp)
    app.register_blueprint(allergen_bp)
    register_error_handlers(app)

    @app.get("/api/health")
    def health() -> tuple:
        """Lightweight liveness probe used by Docker and clients."""
        return jsonify({"status": "ok"}), 200

    return app
