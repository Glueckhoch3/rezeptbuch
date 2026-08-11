"""Shared Flask extension instances.

Kept in a dedicated module so they can be imported without triggering a
circular import through the application factory.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
# In-memory storage (no Redis dependency, matches the app's current lack of a
# cache/session store). Limits are applied per-route via @limiter.limit(...)
# on write endpoints only — GET endpoints and /api/health stay unmetered.
limiter = Limiter(key_func=get_remote_address)
