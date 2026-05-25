# Database Rules (Prisma + PostgreSQL)

## Schema Location
`backend/prisma/schema.prisma`

## Naming Conventions
- Models: `PascalCase` (e.g., `ClassSection`, `AttendanceRecord`)
- Fields: `snake_case` (e.g., `created_at`, `admin_id`, `full_name`)
- Primary key: `{model_name}_id` (e.g., `notification_id`, `feedback_id`)
- Foreign key: `{referenced_model}_id` (e.g., `admin_id`, `parent_id`)
- Junction tables: combine both model names (e.g., `StudentParent`)

## Schema Change Workflow
```bash
# 1. Edit schema.prisma
# 2. Create migration
npx prisma migrate dev --name descriptive-name
# 3. Regenerate client
npx prisma generate
# 4. Rebuild backend
npx nest build
```

## Field Defaults
- Timestamps: `@default(now())` for `created_at`
- New optional fields: always use `?` or `@default()` to avoid breaking existing data
- Boolean flags: `@default(false)`
- Enums: use string fields with application-level validation, NOT Prisma enums

## Relation Patterns

### One-to-Many
```prisma
model Admin {
  admin_id      Int            @id @default(autoincrement())
  notifications Notification[]
}
model Notification {
  notification_id Int    @id @default(autoincrement())
  admin_id        Int
  admin           Admin  @relation(fields: [admin_id], references: [admin_id])
}
```

### Many-to-Many (via junction)
```prisma
model StudentParent {
  student_parent_id Int     @id @default(autoincrement())
  student_id        Int
  parent_id         Int
  relationship      String?
  student           Student @relation(fields: [student_id], references: [student_id])
  parent            Parent  @relation(fields: [parent_id], references: [parent_id])
  @@unique([student_id, parent_id])
}
```

## Query Patterns

### Always use `select` (avoid over-fetching)
```ts
const select = {
  notification_id: true,
  title: true,
  content: true,
  created_at: true,
  admin: { select: { full_name: true } },
} satisfies Prisma.NotificationSelect;
```

### Role-based filtering with OR
```ts
where: {
  OR: [
    { target_role: null },                    // broadcast
    { target_role: 'parent', target_id: null }, // all parents
    { target_role: 'parent', target_id: parentId }, // specific parent
  ],
}
```

### Pagination
```ts
const [data, total] = await Promise.all([
  this.prisma.entity.findMany({ where, select, skip, take, orderBy }),
  this.prisma.entity.count({ where }),
]);
```

## Known Gotchas
- **FK constraint errors**: Never hardcode IDs. Always query dynamically:
  ```ts
  const admin = await this.prisma.admin.findFirst();
  if (!admin) throw new Error('No admin found');
  // use admin.admin_id
  ```
- **Unique constraint**: Wrap in try/catch for `P2002` error code
- **Cascade deletes**: Always specify `onDelete` behavior in relations
