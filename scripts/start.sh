#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example and fill in values."
  exit 1
fi

echo "Starting TM Scheduler services..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
echo "All services started. Frontend: http://localhost  API: http://localhost:3000/api/v1"
