# Security & Auth Rules

## Authentication Flow
- Backend: JWT with access token + refresh token
- Guard stack: `@UseGuards(JwtAuthGuard, RolesGuard)` on every controller
- Token storage: HTTP-only cookie (frontend)
- User context: `req.user = { userId, role }` from JWT payload

## Authorization

### Backend RBAC
```ts
@Roles('admin')           // admin only
@Roles('parent')          // parent only
@Roles('teacher')         // teacher only
@Roles('parent', 'teacher') // either role
```
- Role check happens in `RolesGuard`, NOT in service layer
- Services receive `userId` from controller, never trust client-sent IDs

### Frontend Route Protection
- `middleware.ts` at root: redirects unauthenticated users to `/login`
- Role-based routing: `/admin/*`, `/parent/*`, `/teacher/*`
- Sidebar nav items are role-specific (defined in `AppSidebar.tsx`)

## Data Access Rules

### Parent Isolation
- Parents can ONLY see their linked students' data
- Enforced via `StudentParent` junction table
- Every parent query MUST filter by `parent_id` from JWT

### Teacher Scope
- Teachers see attendance for their assigned class sections only
- Enforced via `ClassSection.teacher_id`

### Admin Full Access
- Admins see all data across all entities
- Admin-only endpoints: CRUD for students, parents, scores, notifications

## Input Validation
- All DTOs use `class-validator` — never trust raw input
- `ValidationPipe` globally enabled in `main.ts`
- File uploads: validate MIME type and size
- Query params: use `@Type(() => Number)` for numeric query strings

## Sensitive Data
- Never return passwords in API responses
- Use `select` to exclude sensitive fields
- OTP codes: auto-expire, single-use
- Logout: clear cookies + invalidate refresh token

## Frontend Security
- No sensitive data in localStorage (only notification read status)
- API client (`lib/axios.ts`) attaches JWT automatically
- 401 responses: redirect to login, clear auth state
- Never expose admin endpoints in parent/teacher service files
