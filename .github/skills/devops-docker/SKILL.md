---
name: devops-docker
description: "Use when: setting up Docker, writing Dockerfiles, docker-compose configuration, nginx setup, deployment scripts, environment variables management, CI/CD, container health checks, infrastructure setup, running the application, production deployment, lightweight containers"
argument-hint: "Describe the DevOps task (e.g., 'set up docker compose for dev and prod', 'add nginx config')"
---
# DevOps Docker Skill

Docker-first infrastructure engineering for the TM Scheduler.

## When to Use
- Creating or modifying Dockerfiles
- Updating docker-compose configuration
- Writing deployment or utility scripts
- Setting up nginx for the frontend
- Managing environment variable configuration
- Optimising container image sizes

## Procedure
1. **Read current config** — `wiki/techstack/devops.md`
2. **Identify what changed** — backend/frontend/db update?
3. **Update Dockerfiles** — use multi-stage builds
4. **Update docker-compose** — add healthchecks and depends_on
5. **Update scripts** — `scripts/*.sh` as needed
6. **Build test** — `docker compose build` must succeed
7. **Smoke test** — `docker compose up -d` + check health endpoints
8. **Update wiki** — `wiki/techstack/devops.md`

## Reference Files
- [Docker Setup Guide](./references/docker-setup.md)
- [Environment Variables](./references/env-config.md)
- [Nginx Configuration](./references/nginx-config.md)

## Docker Compose Files
```
docker-compose.yml       # Production-like compose (default)
docker-compose.dev.yml   # Dev overrides (hot reload, exposed ports)
docker-compose.test.yml  # Test environment
```

Start dev: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

## Scripts Reference
| Script | Purpose |
|--------|---------|
| `scripts/start.sh` | Start all services (detached) |
| `scripts/stop.sh` | Stop all services |
| `scripts/reset.sh` | Full reset with volume wipe (dev only) |
| `scripts/logs.sh` | Tail logs for all services |
| `scripts/migrate.sh` | Run TypeORM migrations |
| `scripts/backup-db.sh` | Dump PostgreSQL to file |

## Image Size Targets
| Service | Target |
|---------|--------|
| Backend | < 200 MB |
| Frontend (nginx) | < 50 MB |
| PostgreSQL | Use official `postgres:16-alpine` |

## Health Endpoint Requirements
- `GET /health` on backend → `200 { status: 'ok', db: 'ok' }`
- `/` on nginx frontend → `200`
- `pg_isready` for PostgreSQL

## Environment Variables Template (.env.example)
```env
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=change_me_in_production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tm_scheduler
DB_USER=tm_user
DB_PASSWORD=change_me_in_production

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```
