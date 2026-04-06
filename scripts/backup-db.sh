#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$ROOT_DIR/backups"
mkdir -p "$BACKUP_DIR"

source .env

BACKUP_FILE="$BACKUP_DIR/tm_scheduler_$TIMESTAMP.sql"
docker compose exec -T postgres pg_dump -U "${DB_USER:-tm_user}" "${DB_NAME:-tm_scheduler}" > "$BACKUP_FILE"
echo "Database backed up to $BACKUP_FILE"
