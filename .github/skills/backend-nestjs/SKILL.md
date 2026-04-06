---
name: backend-nestjs
description: "Use when: building NestJS modules, writing TypeORM entities, creating migrations, implementing services and controllers, designing REST APIs, adding guards/interceptors/pipes, PostgreSQL queries, NestJS best practices, authentication, DTO validation, dependency injection patterns"
argument-hint: "Describe the backend task (e.g., 'create member module with CRUD')"
---
# Backend NestJS Skill

Senior-level NestJS engineering patterns for the TM Scheduler backend.

## When to Use
- Creating or modifying NestJS modules
- Writing TypeORM entities and migrations
- Designing REST API endpoints
- Implementing business logic in services
- Adding auth guards, interceptors, or pipes
- Database query optimisation

## Procedure
1. **Read context** — load `wiki/techstack/backend.md` and relevant feature wiki
2. **Plan structure** — map out module files needed
3. **Entities first** — define the TypeORM entity with proper decorators
4. **Migration** — generate a migration for the schema change
5. **DTOs** — create request/response DTOs with `class-validator`
6. **Service** — implement business logic with proper error handling
7. **Controller** — wire endpoints, apply guards and pipes
8. **Tests** — write unit tests for every service method
9. **Build** — `cd backend && npm run build` must pass
10. **Test run** — `npm run test` all passing

## Reference Files
- [NestJS Architecture Patterns](./references/nestjs-architecture.md)
- [NestJS Best Practices](./references/nestjs-best-practices.md)

## File Naming Convention
```
backend/src/
├── modules/
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       ├── <feature>.service.spec.ts
│       ├── dto/
│       │   ├── create-<feature>.dto.ts
│       │   └── update-<feature>.dto.ts
│       └── entities/
│           └── <feature>.entity.ts
├── migrations/
│   └── YYYYMMDDHHMMSS-<description>.ts
└── common/
    ├── guards/
    ├── interceptors/
    ├── pipes/
    └── filters/
```

## Quick Patterns

### Entity
```typescript
@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.Active })
  status: MemberStatus;
  @Column({ type: 'int', default: 0 }) project_level: number;
  @CreateDateColumn() created_at: Date;
}
```

### DTO
```typescript
export class CreateMemberDto {
  @IsString() @IsNotEmpty() @MaxLength(100) name: string;
  @IsEnum(MemberStatus) status: MemberStatus;
  @IsInt() @Min(0) @Max(10) project_level: number;
}
```

### Service
```typescript
@Injectable()
export class MemberService {
  constructor(@InjectRepository(Member) private repo: Repository<Member>) {}

  async findEligibleSpeakers(): Promise<Member[]> {
    return this.repo.find({
      where: { status: MemberStatus.Active, project_level: LessThan(10) },
      order: { project_level: 'ASC' },
    });
  }
}
```

### Controller
```typescript
@Controller('members')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('speakers/eligible')
  @HttpCode(HttpStatus.OK)
  findEligibleSpeakers(): Promise<Member[]> {
    return this.memberService.findEligibleSpeakers();
  }
}
```
