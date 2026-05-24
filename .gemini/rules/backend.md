# Backend Rules (NestJS + Prisma)

## Module Structure

Every new module MUST follow this structure:
```
modules/{name}/
├── {name}.module.ts         ← imports, providers, exports
├── {name}.controller.ts     ← REST endpoints
├── {name}.service.ts        ← business logic
└── dto/
    ├── create-{name}.dto.ts
    └── update-{name}.dto.ts
```

## Controller Rules

- Decorate with `@ApiTags`, `@ApiBearerAuth`, `@UseGuards(JwtAuthGuard, RolesGuard)`
- Use `@Roles()` decorator for RBAC — never check role in service
- Use `@ParseIntPipe` for numeric params
- Use DTO types for `@Body()`
- Response types via `@ApiResponse({ status, description })`

## Service Rules

- Inject `PrismaService` via constructor
- Always define `select` objects to avoid returning full rows:
  ```ts
  const notificationSelect = { notification_id: true, title: true, ... } satisfies Prisma.NotificationSelect;
  ```
- Never hardcode foreign key IDs — always query from DB dynamically
- Use transactions (`this.prisma.$transaction`) for multi-table writes
- Throw NestJS exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`

## DTO Rules

- Use `class-validator` decorators: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsInt()`
- Use `@ApiProperty()` / `@ApiPropertyOptional()` for Swagger
- Create DTO = required fields. Update DTO = all optional fields
- Use `@Type(() => Number)` from `class-transformer` for query params

## Database Rules

- Schema file: `backend/prisma/schema.prisma`
- After schema changes: `npx prisma migrate dev --name <description>`
- Then: `npx prisma generate`
- Naming: `snake_case` for columns, `PascalCase` for models
- Relations: explicit `@relation` with `onDelete` behavior
- Always add new fields as optional (`?`) or with `@default()` to avoid breaking existing data

## Query Patterns

- Avoid N+1: use `include` or `select` with nested relations
- Paginated queries: accept `skip` + `take` params
- Filtering: build dynamic `where` clause from query DTO
- Sorting: accept `orderBy` param, default to `created_at: 'desc'`
- Role-based data: use `OR` conditions with `target_role` / `target_id` patterns

## Error Handling

- Use NestJS global exception filter (already configured)
- Service errors → throw HttpException subclass
- Prisma errors → catch `PrismaClientKnownRequestError` for FK violations
- Never return raw Prisma errors to client
