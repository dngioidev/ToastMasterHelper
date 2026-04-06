# Tech Stack — Overview

## Architecture Decisions

| Layer | Technology | Decision Record |
|-------|-----------|-----------------|
| Backend | NestJS 10 + TypeScript | [ADR-001](../history/decisions.md#adr-001) |
| Frontend | React 18 + Vite + TailwindCSS | [ADR-002](../history/decisions.md#adr-002) |
| Database | PostgreSQL 16 + TypeORM | [ADR-001](../history/decisions.md#adr-001) |
| Infrastructure | Docker + Docker Compose | [ADR-003](../history/decisions.md#adr-003) |
| Auth | JWT (access + refresh tokens) | Planned |

## Detailed Files

- [Backend →](./backend.md) — NestJS architecture, module structure, ORM config
- [Frontend →](./frontend.md) — React architecture, state management, component system
- [Database →](./database.md) — ERD, schema, migration strategy
- [DevOps →](./devops.md) — Docker setup, scripts, environment management
