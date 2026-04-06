# NestJS Best Practices

## Guards
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Apply globally with exemptions
app.useGlobalGuards(new JwtAuthGuard(reflector));
// Public routes: @Public() decorator + AllowPublicMetadata guard
```

## Validation Pipe (Global)
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // strip extra properties
  forbidNonWhitelisted: true,
  transform: true,          // auto-transform to DTO types
  transformOptions: { enableImplicitConversion: true },
}));
```

## TypeORM Migration Workflow
```bash
# Generate migration after entity change
npm run migration:generate -- -n AddMemberProjectLevel

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

Never use `synchronize: true` outside of unit tests.

## Security Patterns
- Use `helmet()` middleware
- Configure CORS explicitly: `origin: process.env.FRONTEND_URL`
- Rate limit auth endpoints with `@nestjs/throttler`
- Hash passwords with `bcrypt` (cost factor ≥ 12)
- JWT expiry: access token 15min, refresh token 7d

## Logging
Use NestJS built-in Logger:
```typescript
private readonly logger = new Logger(SessionService.name);
this.logger.log(`Creating session for date: ${date}`);
this.logger.error(`Failed to assign roles`, error.stack);
```
Never log sensitive data (passwords, tokens, PII).

## Health Check
```typescript
@Module({
  imports: [TerminusModule, TypeOrmModule],
  controllers: [HealthController],
})
// GET /health → { status: 'ok', info: { db: { status: 'up' } } }
```

## Testing Patterns
```typescript
// Mock repository factory
function createMockRepo<T>(): jest.Mocked<Repository<T>> {
  return {
    find: jest.fn(), findOne: jest.fn(), save: jest.fn(),
    create: jest.fn(), update: jest.fn(), delete: jest.fn(),
  } as any;
}

// Test module setup
const module = await Test.createTestingModule({
  providers: [
    SessionService,
    { provide: getRepositoryToken(Session), useValue: createMockRepo() },
    { provide: getRepositoryToken(Member), useValue: createMockRepo() },
  ],
}).compile();
```
