#!/usr/bin/env bash
# =============================================================================
# uninstall.sh — TM Scheduler uninstaller
#
# Usage:
#   bash uninstall.sh [OPTIONS]
#
# Options:
#   --remove-data    Also delete Docker volumes (database + pgAdmin data).
#                    WARNING: This is IRREVERSIBLE. Back up the database first.
#   --help           Show this message
#
# Default behaviour (no flags):
#   Stops and removes all containers. Volumes are PRESERVED so you can
#   reinstall later without losing data.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"

# ─── Argument parsing ─────────────────────────────────────────────────────────
REMOVE_DATA=false
for arg in "$@"; do
  case "${arg}" in
    --remove-data) REMOVE_DATA=true ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,2\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg}"
      echo "Run 'bash uninstall.sh --help' for usage."
      exit 1
      ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[uninstall] $*"; }
die()  { echo "[uninstall] ERROR: $*" >&2; exit 1; }
hr()   { printf '%.0s─' {1..60}; echo; }

# ─── Pre-flight ───────────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 \
  || die "Docker is not installed."

docker compose version >/dev/null 2>&1 \
  || die "Docker Compose plugin is not found."

[[ -f "${COMPOSE_FILE}" ]] \
  || die "docker-compose.yml not found in ${SCRIPT_DIR}"

# ─── Confirmation for destructive action ──────────────────────────────────────
if [[ "${REMOVE_DATA}" == "true" ]]; then
  hr
  echo ""
  echo "  ⚠  WARNING: --remove-data will permanently delete the database"
  echo "     and all pgAdmin settings. This CANNOT be undone."
  echo ""
  echo "  Back up your data first:"
  echo "    docker compose exec postgres pg_dump -U tm_user tm_scheduler > backup.sql"
  echo ""
  read -r -p "  Type 'yes' to confirm permanent data deletion: " CONFIRM
  if [[ "${CONFIRM}" != "yes" ]]; then
    echo ""
    log "Aborted. No changes were made."
    exit 0
  fi
  echo ""
fi

# ─── Stop and remove containers ───────────────────────────────────────────────
hr
log "Stopping and removing containers ..."

COMPOSE_ARGS=(--file "${COMPOSE_FILE}")
[[ -f "${ENV_FILE}" ]] && COMPOSE_ARGS+=(--env-file "${ENV_FILE}")

docker compose "${COMPOSE_ARGS[@]}" down

log "Containers removed."

# ─── Optionally remove volumes ────────────────────────────────────────────────
if [[ "${REMOVE_DATA}" == "true" ]]; then
  log "Removing Docker volumes ..."
  docker compose "${COMPOSE_ARGS[@]}" down --volumes
  log "Volumes removed. All application data has been deleted."
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
hr
log "TM Scheduler has been stopped and removed."

if [[ "${REMOVE_DATA}" == "false" ]]; then
  echo ""
  echo "  Database volumes are preserved."
  echo "  To also remove all data, run:"
  echo "    bash uninstall.sh --remove-data"
  echo ""
  echo "  To reinstall, run:"
  echo "    bash install.sh"
fi
echo ""
