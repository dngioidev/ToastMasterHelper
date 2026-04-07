# DevOps & Infrastructure

## Stack
- **Container**: Docker + Docker Compose
- **Backend runtime**: Node 20 Alpine
- **Frontend server**: nginx Alpine
- **Database**: PostgreSQL 16 Alpine

## File Structure
```
tm-scheduler/
├── docker/
│   ├── backend.dockerfile
│   ├── frontend.dockerfile
│   └── nginx.conf
├── docker-compose.yml          # Shared base config
├── docker-compose.dev.yml      # Dev overrides (hot reload)
├── docker-compose.prod.yml     # Prod hardening
├── scripts/
│   ├── start.sh                # Start all services
│   ├── stop.sh                 # Stop all services
│   ├── reset.sh                # Full reset (dev only)
│   ├── logs.sh                 # Tail logs
│   ├── migrate.sh              # Run TypeORM migrations
│   └── backup-db.sh            # DB dump
└── .env.example
```

## Quick Start (Developer)
```bash
# 1. Copy env file
cp .env.example .env
# Edit .env with your values

# 2. Start all services
./scripts/start.sh

# 3. Run migrations
./scripts/migrate.sh

# 4. Open in browser
# Frontend: http://localhost
# Backend API: http://localhost/api/v1
# Health: http://localhost:3000/health
```

## Service Ports
| Service | Internal | Exposed (dev) |
|---------|----------|---------------|
| Backend | 3000 | 3000 |
| Frontend (nginx) | 80 | 80 |
| PostgreSQL | 5432 | 5432 (dev only) |
| pgAdmin 4 | 80 | 5050 |

## pgAdmin 4 (Postgres UI)
Access the database browser at **http://localhost:5050** after starting containers.

**Login credentials** (from `.env`):
- Email: `PGADMIN_EMAIL` (default: `admin@example.com`)
- Password: `PGADMIN_PASSWORD` (default: `pgadmin`)

pgAdmin runs in **Desktop mode** (`PGADMIN_CONFIG_SERVER_MODE=False`) — no server-side login screen, just the browser UI.

**Add a server connection** (first time only):
1. Click **Add New Server** on the dashboard
2. **General** tab → Name: `tm-scheduler`
3. **Connection** tab:
   - Host: `postgres`
   - Port: `5432`
   - Maintenance database: `tm_scheduler`
   - Username: `tm_user` (your `DB_USER`)
   - Password: value of `DB_PASSWORD` in `.env`
4. Click **Save** — the database tree appears on the left

Data is persisted in the `pgadmin_data` Docker volume so the server connection survives restarts.

## Environment Variables
See `.env.example` for all required variables. Key ones:
- `JWT_SECRET` — must be ≥ 32 chars random string in production
- `DATABASE_URL` — full PostgreSQL connection string
- `NODE_ENV` — `development` | `production` | `test`
- `VITE_API_BASE_URL` — frontend API base (e.g. `/api/v1`)

## Image Size Targets
| Service | Target | Multi-stage |
|---------|--------|------------|
| Backend | < 200 MB | ✅ Yes |
| Frontend | < 50 MB | ✅ Yes (nginx) |

## Health Checks
- `GET /health` (backend) → `{ status: 'ok', db: 'ok' }`
- `pg_isready -U $DB_USER` (postgres)
- nginx serves `/health` → 200

## CI/CD (Future)
- GitHub Actions workflow in `.github/workflows/`
- Steps: lint → test → build → docker build → deploy
