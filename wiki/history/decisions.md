# Decision Log

Architecture and product decisions with rationale.

## Template
```
## ADR-NNN: <Decision title>
**Date**: YYYY-MM-DD
**Status**: Accepted | Superseded | Deprecated
**Decided by**: Agent/role

### Context
<What problem or question triggered this decision>

### Options Considered
1. Option A — pros/cons
2. Option B — pros/cons

### Decision
<What was chosen and why>

### Consequences
<Trade-offs and future implications>
```

---

## ADR-001: NestJS as backend framework
**Date**: 2026-04-07
**Status**: Accepted

### Context
Need a structured TypeScript backend framework for a scheduling API with complex business rules.

### Decision
NestJS with TypeORM and PostgreSQL. Provides: opinionated module structure, built-in DI, decorators for validation, good TypeScript support.

### Consequences
- Learning curve for engineers unfamiliar with NestJS decorators
- Excellent testability via `@nestjs/testing`
- Feature-folder structure enforced from day one

---

## ADR-002: React + Vite + TailwindCSS as frontend stack
**Date**: 2026-04-07
**Status**: Accepted

### Context
Need a fast, modern frontend with utility-first styling.

### Decision
React 18 + Vite + TailwindCSS + React Query. Vite for fast builds, Tailwind for rapid UI development, React Query for server state management.

### Consequences
- No heavy CSS framework (no Bootstrap/MUI) — all custom components
- Faster build times (Vite vs CRA)
- Bundle size must be monitored manually

---

## ADR-003: Docker Compose for local dev and production
**Date**: 2026-04-07
**Status**: Accepted

### Context
Need reproducible environment for dev and production.

### Decision
Multi-stage Dockerfiles + Docker Compose with separate dev/prod files.

### Consequences
- Single command startup: `docker compose up`
- Dev hot-reload via volume mounts
- Production images are minimal (< 200MB backend, < 50MB frontend)
