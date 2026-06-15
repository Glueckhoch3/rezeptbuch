#!/usr/bin/env sh
# Container entrypoint: wait for the database, apply migrations, then serve.
set -e

echo "Waiting for database at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
python - <<'PY'
import os, time, socket
host = os.getenv("POSTGRES_HOST", "db")
port = int(os.getenv("POSTGRES_PORT", "5432"))
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit(f"Database {host}:{port} not reachable in time")
print("Database is reachable.")
PY

echo "Applying database migrations..."
flask --app wsgi db upgrade

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding example recipes..."
  flask --app wsgi seed || echo "Seeding skipped or already applied."
fi

echo "Starting gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 --workers "${GUNICORN_WORKERS:-2}" wsgi:app
