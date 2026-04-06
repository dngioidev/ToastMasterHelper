# Docker Setup Guide

## Service Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   nginx     │────▶│   NestJS    │
│             │     │  :80        │     │  :3000      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │ PostgreSQL   │
                                        │  :5432       │
                                        └─────────────┘
```

## File Organization
```
tm-scheduler/
├── docker/
│   ├── backend.dockerfile
│   ├── frontend.dockerfile
│   └── nginx.conf
├── docker-compose.yml          # Production config
├── docker-compose.dev.yml      # Dev overrides
├── docker-compose.test.yml     # Test environment
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   ├── reset.sh
│   ├── logs.sh
│   ├── migrate.sh
│   └── backup-db.sh
└── .env.example
```

## Nginx Config Template
```nginx
# docker/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # React Router — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health endpoint for Docker
    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
```

## Volume Strategy
- `pg_data` — PostgreSQL data (persist across restarts)
- Backend `dist/` — not mounted in production (baked into image)
- Frontend `dist/` — not mounted in production (baked into nginx image)
- Dev override: mount `backend/src` for hot-reload

## Dev Overrides (docker-compose.dev.yml)
```yaml
services:
  backend:
    command: npm run start:dev
    volumes:
      - ./backend/src:/app/src
    environment:
      NODE_ENV: development

  postgres:
    ports:
      - "5432:5432"  # expose for local DB tools
```
