#!/usr/bin/env bash
# =============================================================================
# install.sh — TM Scheduler offline installer
#
# Usage:
#   bash install.sh [OPTIONS]
#
# Options:
#   --no-db-restore    Skip restoring db-dump.sql (use when upgrading an
#                      existing installation that already has data)
#   --help             Show this message
#
# What this script does:
#   1. Validates Docker / Compose are available
#   2. Loads all Docker images from all-images.tar (offline, no registry needed)
#   3. Starts all services with docker compose
#   4. Waits for PostgreSQL to be healthy
#   5. Restores the database dump (schema + migration records) unless --no-db-restore
# =============================================================================

set -euo pipefail

# ─── Resolve paths relative to the script location ───────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
IMAGES_TAR="${SCRIPT_DIR}/all-images.tar"
DB_DUMP="${SCRIPT_DIR}/db-dump.sql"

# ─── Argument parsing ─────────────────────────────────────────────────────────
NO_DB_RESTORE=false
for arg in "$@"; do
  case "${arg}" in
    --no-db-restore) NO_DB_RESTORE=true ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,2\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: ${arg}"
      echo "Run 'bash install.sh --help' for usage."
      exit 1
      ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[install] $*"; }
warn() { echo "[install] WARNING: $*" >&2; }
die()  { echo "[install] ERROR: $*" >&2; exit 1; }

hr() { printf '%.0s─' {1..60}; echo; }

# ─── Pre-flight checks ────────────────────────────────────────────────────────
hr
log "TM Scheduler — Installer"
hr

command -v docker >/dev/null 2>&1 \
  || die "Docker is not installed. See https://docs.docker.com/engine/install/"

docker compose version >/dev/null 2>&1 \
  || die "Docker Compose plugin is not installed (docker compose v2 required)."

[[ -f "${COMPOSE_FILE}" ]] \
  || die "docker-compose.yml not found in ${SCRIPT_DIR}"

[[ -f "${ENV_FILE}" ]] \
  || die ".env file not found. Copy .env to this directory and fill in the required values (DB_PASSWORD, JWT_SECRET, ADMIN_PASSWORD_HASH, CORS_ORIGIN)."

[[ -f "${IMAGES_TAR}" ]] \
  || die "all-images.tar not found in ${SCRIPT_DIR}"

# Warn if critical env vars look like placeholders
for VAR in DB_PASSWORD JWT_SECRET ADMIN_PASSWORD_HASH; do
  VAL=$(grep -E "^${VAR}=" "${ENV_FILE}" | head -1 | cut -d= -f2- | tr -d ' "')
  if [[ -z "${VAL}" || "${VAL}" == "changeme"* || "${VAL}" == "placeholder"* ]]; then
    warn "${VAR} in .env appears to be a placeholder. Update it before continuing."
  fi
done

# ─── Step 1: Load Docker images ───────────────────────────────────────────────
hr
log "Loading Docker images from all-images.tar (this may take a minute) ..."
docker load --input "${IMAGES_TAR}"
log "Images loaded successfully."

# ─── Step 2: Start all services ───────────────────────────────────────────────
hr
log "Starting services ..."
docker compose \
  --file    "${COMPOSE_FILE}" \
  --env-file "${ENV_FILE}" \
  up -d
log "Services started."

# ─── Step 3: Wait for PostgreSQL to become healthy ────────────────────────────
hr
log "Waiting for PostgreSQL to be ready ..."

MAX_RETRIES=30
RETRIES=0

until docker compose \
        --file "${COMPOSE_FILE}" \
        exec -T postgres \
        pg_isready > /dev/null 2>&1; do
  RETRIES=$((RETRIES + 1))
  if [[ ${RETRIES} -ge ${MAX_RETRIES} ]]; then
    echo ""
    die "PostgreSQL did not become ready after $((MAX_RETRIES * 2)) seconds. Check logs:\n  docker compose --file ${COMPOSE_FILE} logs postgres"
  fi
  printf '.'
  sleep 2
done
echo ""
log "PostgreSQL is ready."

# ─── Step 4: Restore database dump ────────────────────────────────────────────
if [[ "${NO_DB_RESTORE}" == "true" ]]; then
  log "Skipping database restore (--no-db-restore flag set)."
elif [[ ! -f "${DB_DUMP}" ]]; then
  warn "db-dump.sql not found — skipping database restore."
else
  # Only restore if the dump contains real SQL statements (not just comments/empty)
  if grep -qE "^(CREATE|INSERT|ALTER|COPY|SET)" "${DB_DUMP}" 2>/dev/null; then
    hr
    log "Restoring database from db-dump.sql ..."

    # Read credentials from the running postgres container (avoids parsing .env)
    DB_USER_VAL="$(docker compose --file "${COMPOSE_FILE}" exec -T postgres \
                   printenv POSTGRES_USER 2>/dev/null || echo 'tm_user')"
    DB_NAME_VAL="$(docker compose --file "${COMPOSE_FILE}" exec -T postgres \
                   printenv POSTGRES_DB   2>/dev/null || echo 'tm_scheduler')"

    docker compose \
      --file "${COMPOSE_FILE}" \
      exec -T postgres \
      psql -U "${DB_USER_VAL}" -d "${DB_NAME_VAL}" \
      < "${DB_DUMP}"

    log "Database restored successfully."
  else
    warn "db-dump.sql contains no SQL statements — skipping restore."
  fi
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
hr
echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║   TM Scheduler is up and running!               ║"
echo "  ║                                                  ║"
echo "  ║   App     → http://localhost                     ║"
echo "  ║   pgAdmin → http://localhost:5050                ║"
echo "  ║                                                  ║"
echo "  ║   Logs:  docker compose logs -f                  ║"
echo "  ║   Stop:  bash uninstall.sh                       ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""
