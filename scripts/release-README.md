# TM Scheduler — Offline Installation Guide

This package contains everything needed to run TM Scheduler on a server with
**no internet connection**. All Docker images are pre-bundled.

---

## Contents

```
tm-scheduler-<version>/
├── docker-compose.yml   Production Compose config (no build required)
├── .env                 Environment configuration (⚠ edit before installing)
├── all-images.tar       All 4 Docker images (backend, frontend, postgres, pgadmin)
├── db-dump.sql          Database schema + migration state (for fresh installs)
├── install.sh           One-shot installer
├── uninstall.sh         Graceful uninstaller
└── README.md            This file
```

---

## Requirements

| Requirement | Minimum version |
|-------------|----------------|
| Docker Engine | 24.0 |
| Docker Compose Plugin | 2.20 |
| Available disk space | ~2 GB |
| OS | Linux (Ubuntu 20.04+ recommended) |

> **macOS / Windows**: Docker Desktop 4.x works for local testing but is not
> recommended for production deployments.

---

## Fresh Installation

### Step 1 — Edit `.env`

Open `.env` in a text editor and update **all** values marked with `# REQUIRED`:

```bash
nano .env
```

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | Strong password for the PostgreSQL user (required) |
| `JWT_SECRET` | Random string ≥ 32 characters for signing JWTs (required) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin UI password (required) |
| `CORS_ORIGIN` | URL users access the app from, e.g. `http://192.168.1.10` |
| `CORS_ORIGIN` | or a domain: `https://tm.example.com` |

**Generate a JWT secret:**
```bash
openssl rand -hex 32
```

**Generate an admin password hash:**
```bash
node -e "require('bcrypt').hash('YourPassword', 10).then(console.log)"
# Escape every $ as $$ in the .env file
```

### Step 2 — Run the installer

```bash
bash install.sh
```

The installer will:
1. Load all Docker images from `all-images.tar`
2. Start all 4 services in the background
3. Wait for PostgreSQL to be healthy
4. Restore the database schema from `db-dump.sql`

### Step 3 — Access the application

| Service | Default URL |
|---------|-------------|
| Application | http://localhost |
| pgAdmin (DB UI) | http://localhost:5050 |

To use a custom port, set `HTTP_PORT` and `PGADMIN_PORT` in `.env`.

---

## Upgrading to a New Version

```bash
# 1. Optional: back up your current database
docker compose exec postgres \
  pg_dump -U tm_user tm_scheduler > backup-$(date +%Y%m%d).sql

# 2. Extract the new package
tar -xzf tm-scheduler-<new-version>.tar.gz
cd tm-scheduler-<new-version>

# 3. Copy your current .env (DO NOT use the template .env from the new package)
cp ../tm-scheduler-<old-version>/.env .

# 4. Install WITHOUT restoring the dump (keeps your existing data)
bash install.sh --no-db-restore
```

> `--no-db-restore` skips the `db-dump.sql` restore step. Your existing
> database volumes are preserved automatically.

---

## Common Operations

```bash
# View live logs from all services
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend

# Restart a single service
docker compose restart backend

# Check service status
docker compose ps

# Open a psql shell
docker compose exec postgres psql -U tm_user -d tm_scheduler

# Manual database backup
docker compose exec postgres \
  pg_dump -U tm_user tm_scheduler > my-backup.sql
```

---

## Uninstalling

**Stop containers only** (data is preserved):
```bash
bash uninstall.sh
```

**Stop containers AND delete all data** (irreversible):
```bash
bash uninstall.sh --remove-data
```

---

## Firewall / Port Reference

| Port | Service | Notes |
|------|---------|-------|
| 80 | Frontend | Configurable via `HTTP_PORT` in `.env` |
| 5050 | pgAdmin | Configurable via `PGADMIN_PORT` in `.env` |
| 5432 | PostgreSQL | Internal only — not exposed to host by default |
| 3000 | Backend API | Internal only — proxied through nginx |

---

## Troubleshooting

### Services fail to start
```bash
docker compose logs
```

### PostgreSQL health check fails
```bash
docker compose logs postgres
# Check disk space
df -h
```

### Backend cannot connect to database
Verify `DB_PASSWORD` in `.env` matches the postgres container environment.
If you changed the password after the volumes were created, remove the volume
and restart:
```bash
bash uninstall.sh --remove-data
bash install.sh
```

### Port already in use
Change `HTTP_PORT` or `PGADMIN_PORT` in `.env`, then restart:
```bash
docker compose down
docker compose up -d
```

---

## Security Checklist

- [ ] `DB_PASSWORD` is unique and strong (≥ 20 characters)
- [ ] `JWT_SECRET` is random (≥ 32 characters, generated with `openssl rand`)
- [ ] `ADMIN_PASSWORD_HASH` is a real bcrypt hash (not the placeholder)
- [ ] `CORS_ORIGIN` is set to your exact application URL
- [ ] Firewall blocks port 5432 from external access
- [ ] pgAdmin port (5050) is not exposed publicly in production
