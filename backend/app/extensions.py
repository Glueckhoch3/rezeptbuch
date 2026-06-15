"""Shared Flask extension instances.

Kept in a dedicated module so they can be imported without triggering a
circular import through the application factory.
"""

from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
