# Backend Tech Stack

## Core Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | ^10 | Backend framework |
| TypeScript | ^5 | Language |
| TypeORM | ^0.3 | ORM |
| PostgreSQL | 16 | Database |
| class-validator | ^0.14 | DTO validation |
| class-transformer | ^0.5 | DTO transformation |
| @nestjs/jwt | ^10 | JWT authentication |
| @nestjs/passport | — | Auth strategy |
| @nestjs/config | — | Config management |
| @nestjs/terminus | — | Health checks |

## Module Structure
```
backend/src/
├── app.module.ts             # Root module
├── main.ts                   # Bootstrap
├── common/
│   ├── guards/               # JwtAuthGuard, RolesGuard
│   ├── interceptors/         # LoggingInterceptor, TransformInterceptor
│   ├── filters/              # GlobalExceptionFilter
│   └── pipes/                # ValidationPipe (global)
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts
├── modules/
│   ├── auth/
│   ├── members/
│   ├── sessions/
│   │   ├── online/
│   │   └── offline/
│   └── config/               # App configuration (num_speakers etc)
└── migrations/
```

## API Conventions
- Base path: `/api/v1/`
- Auth: Bearer JWT header on all protected routes
- Validation: `ValidationPipe` with `whitelist: true, transform: true`
- Response shape: `{ data: T }` for single, `{ data: T[], meta: { total, page, limit } }` for lists
- Errors: `{ statusCode, message, error }`

## TypeORM Configuration
```typescript
// config/database.config.ts
{
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,  // NEVER true in prod
  logging: process.env.NODE_ENV === 'development',
}
```

## Scripts
```json
{
  "start:dev": "nest start --watch",
  "build": "nest build",
  "test": "jest --passWithNoTests",
  "test:cov": "jest --coverage",
  "migration:generate": "typeorm migration:generate",
  "migration:run": "typeorm migration:run",
  "migration:revert": "typeorm migration:revert"
}
```
