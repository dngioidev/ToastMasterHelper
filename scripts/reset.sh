#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"
echo "WARNING: This will destroy all data volumes. Ctrl+C to cancel (5s)..."
sleep 5

docker compose down -v --remove-orphans
echo "Full reset done."
