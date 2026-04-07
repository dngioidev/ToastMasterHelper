#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"
echo "Building backend..."
docker compose exec backend npm run build
echo "Running TypeORM migrations..."
docker compose exec backend npm run migration:run
echo "Migrations complete."
