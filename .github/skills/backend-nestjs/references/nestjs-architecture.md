# NestJS Architecture Patterns

## Module Structure
Every feature lives in its own module folder. The module is the unit of encapsulation.

```
modules/
└── session/
    ├── session.module.ts          # Imports, exports, providers declaration
    ├── session.controller.ts      # HTTP layer — thin, delegates to service
    ├── session.service.ts         # Business logic — all rules go here
    ├── session.service.spec.ts    # Jest unit tests
    ├── dto/
    │   ├── create-session.dto.ts
    │   └── update-session.dto.ts
    └── entities/
        └── session.entity.ts
```

## Provider Registration
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Session, Member])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],  // only export if another module needs it
})
export class SessionModule {}
```

## Dependency Injection
- Always inject via constructor
- Use interfaces for testability
- Never use `ModuleRef.get()` unless truly dynamic

## Exception Handling
Throw domain-specific HTTP exceptions from the service, NOT the controller:
```typescript
// service.ts
if (!member) throw new NotFoundException(`Member ${id} not found`);
if (member.project_level >= 10) throw new BadRequestException('Member has completed speaker track');
```

## Global Config Pattern
```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    PORT: Joi.number().default(3000),
  }),
}),
```

## TypeORM Repository Pattern
Always inject typed repositories, never use EntityManager directly:
```typescript
constructor(
  @InjectRepository(Member) private memberRepo: Repository<Member>,
) {}
```

## Pagination
Use consistent cursor or offset pagination DTOs:
```typescript
export class PaginationDto {
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) @Type(() => Number) limit = 20;
}
```

## Response Transform
Use a global interceptor to wrap all responses in consistent shape:
```typescript
{ data: T, meta?: { total, page, limit } }
```
