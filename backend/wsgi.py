"""WSGI entry point used by gunicorn and ``flask`` CLI commands."""

from app import create_app
from app.cli import register_cli

app = create_app()
register_cli(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
