---
description: "Use when: writing NestJS backend code, creating TypeScript files in backend/, TypeORM entities, NestJS services, controllers, DTOs, modules, migrations, guards, interceptors"
applyTo: "backend/src/**/*.ts"
---
# Backend Code Standards

## TypeScript
- Strict mode: `"strict": true` in `tsconfig.json`
- No `any` — use `unknown` and type-narrow
- All function parameters and return types must be explicit

## NestJS Conventions
- Feature-folder module structure per `wiki/techstack/backend.md`
- DTOs use `class-validator` — every input validated
- Services throw `HttpException` subclasses (never raw Error)
- Controllers are thin — no business logic
- One TypeORM repository injected per entity accessed

## Naming
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Interfaces: `PascalCase` (no `I` prefix)
- Enums: `PascalCase` values

## Import Order
1. NestJS core
2. Third-party
3. Internal (absolute path `src/`)
4. Relative (`./ ../`)

## Database
- Never use `synchronize: true` outside tests
- All schema changes need a TypeORM migration file
- Use `Repository<T>` — never raw `EntityManager` or `DataSource` queries unless needed for complex joins

## Testing
- Every `.service.ts` has a matching `.service.spec.ts`
- Mock all external dependencies in unit tests
- Run `npm run test` before marking any task done
