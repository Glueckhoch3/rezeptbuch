"""Configuration objects resolved from environment variables.

All runtime configuration is read from the environment so the same image can
run in development, test, and production without code changes. Values default
to safe local settings; secrets must come from the root ``.env`` file.
"""

from __future__ import annotations

import os


def _database_uri() -> str:
    """Build a SQLAlchemy database URI from individual env vars.

    A full ``DATABASE_URL`` takes precedence when provided (useful for managed
    databases); otherwise the URI is assembled from the discrete Postgres
    variables shared with the database container.
    """
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    user = os.getenv("POSTGRES_USER", "rezeptbuch")
    password = os.getenv("POSTGRES_PASSWORD", "rezeptbuch")
    host = os.getenv("POSTGRES_HOST", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    name = os.getenv("POSTGRES_DB", "rezeptbuch")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"


class Config:
    """Base configuration shared by every environment."""

    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("BACKEND_SECRET_KEY", "dev-secret-change-me")
    # Comma-separated list of allowed origins for the browser frontend.
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    JSON_SORT_KEYS = False


class TestConfig(Config):
    """Configuration for the automated test suite.

    Tests use an in-memory SQLite database so they require no external
    services and stay fast and deterministic.
    """

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    CORS_ORIGINS = ["http://localhost:5173"]


def get_config() -> type[Config]:
    """Return the config class selected by the ``FLASK_ENV`` variable."""
    if os.getenv("FLASK_ENV") == "test":
        return TestConfig
    return Config
