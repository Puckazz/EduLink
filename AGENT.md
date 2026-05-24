# EduLink – Agent Context

## Project Overview

EduLink (UniConnect) là hệ thống quản lý giáo dục với 3 role: **Admin**, **Teacher**, **Parent**.

| Layer | Stack | Path |
|-------|-------|------|
| Frontend | Next.js 15 (App Router) + Tailwind v4 + shadcn/ui | `frontend/` |
| Backend | NestJS + Prisma + PostgreSQL | `backend/` |
| Auth | JWT (access + refresh token) | `backend/src/modules/auth/` |

## Architecture

```
frontend/src/
├── app/(dashboard)/{admin,parent,teacher}/   ← route groups by role
├── components/{admin,parent,teacher}/         ← role-specific components
├── components/shared/                         ← shared (Header, Sidebar, PaginationBar)
├── components/ui/                             ← shadcn primitives (DO NOT modify logic)
├── components/notifications/                  ← cross-role notification components
├── hooks/{queries,mutations}/                 ← react-query hooks
├── services/                                  ← API client layer (axios)
├── types/                                     ← shared TS interfaces
└── lib/                                       ← utils, axios instance

backend/src/
├── modules/{module}/
│   ├── {module}.module.ts
│   ├── {module}.controller.ts
│   ├── {module}.service.ts
│   └── dto/
├── common/
│   ├── guards/        ← JwtAuthGuard, RolesGuard
│   └── decorators/    ← @Roles()
└── prisma/            ← PrismaService
```

## Prisma Models (18 models)

Admin, Teacher, Parent, Student, StudentParent, Major, Subject, Score, ScoreLog,
Attendance, Notification, Feedback, FeedbackMessage, ClassSection, ClassEnrollment,
AttendanceSession, AttendanceRecord, Otp

## Design System Rules

### Token-based styling (CRITICAL)
- ✅ Use: `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`, `text-primary`, `bg-destructive/10`
- ❌ Never hardcode: `text-slate-900`, `bg-gray-100`, `text-blue-600` etc.
- Exception: specific accent colors like `bg-blue-500` for notification dot, `text-red-500` for logout

### UI Components (shadcn/ui)
- All primitives in `components/ui/` — use as-is, do not rewrite
- Shared components: `PaginationBar`, `Header`, `AppSidebar`, `NotificationBell`
- Use `Card`, `Button`, `Input`, `Select`, `Dialog`, `Tabs`, `DropdownMenu` from shadcn
- Toast notifications via `sonner` (use `toast.success()`, `toast.error()`)
- Charts via `recharts`

### Layout Conventions
- Page header: `<h1>` with `text-2xl font-bold text-foreground` + subtitle `text-sm text-muted-foreground`
- Page spacing: `space-y-6 pb-12`
- Table pages: Card wrapper → table → PaginationBar
- Filter/toolbar: between header and content card

## API Conventions

### Backend (NestJS)
- Every endpoint has DTO with `class-validator` decorators
- Use `@Roles('admin')` / `@Roles('parent', 'teacher')` for RBAC
- Services use `PrismaService` injection
- Always define `select` object to avoid over-fetching
- Error responses via NestJS built-in exceptions (`NotFoundException`, etc.)

### Frontend (API Layer)
- All API calls in `services/*.service.ts`
- Use `@tanstack/react-query` for data fetching (`useQuery` / `useMutation`)
- Query key convention: `['entity-name']` or `['entity-name', id]`
- Mutations must `invalidateQueries` on success

## State Management
- Server state: react-query (no Redux/Zustand)
- Client state: React useState/useEffect
- Cross-component sync: localStorage + CustomEvent (see `useNotificationStatus`)
- Auth: JWT stored in cookie, user profile via `useCurrentUser()`

## Execution Rules

1. **Always lint after editing**: `npx eslint <file> --max-warnings=0`
2. **Always build-check backend**: `npx nest build` after service/controller changes
3. **Never break existing functionality** — check imports, types, existing tests
4. **Preserve all comments and docstrings** unrelated to changes
5. **Vietnamese UI text** — all user-facing strings in Vietnamese
