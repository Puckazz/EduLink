# Project Decisions & Known Patterns

## Architecture Decisions

### Notification System (May 2026)
- **Decision**: Auto-notification when feedback is created/replied
- **Implementation**: `FeedbackService` creates `Notification` records directly via `PrismaService`
- **Targeting**: `target_role` + `target_id` fields on Notification model
  - `null` / `null` = broadcast to all
  - `'parent'` / `null` = all parents
  - `'parent'` / `5` = specific parent
  - `'admin'` / `1` = specific admin (feedback inbox)
- **Admin resolution**: `getSystemAdminId()` queries first admin dynamically — never hardcode

### State Sync Pattern (May 2026)
- **Problem**: Notification read status not syncing between Bell popup and List page
- **Solution**: `useNotificationStatus` hook using localStorage + CustomEvent + storage event
- **Apply when**: Any cross-component client state that must stay in sync without server round-trip

### Design Token Migration (May 2026)
- **Decision**: Migrate all hardcoded `slate-*`, `gray-*` colors to design tokens
- **Reason**: Dark mode support, consistency, maintainability
- **Exception list**: `bg-blue-500` (unread dot), `text-red-500` (logout/danger), `text-emerald-500` (verified)

## Known Bugs Fixed

### FK Constraint on Notification Create
- **Symptom**: `Foreign key constraint violated: admin_id` when creating feedback
- **Cause**: Hardcoded `admin_id: 1` in notification creation
- **Fix**: Dynamic query `this.prisma.admin.findFirst()` → use result's `admin_id`
- **File**: `backend/src/modules/feedback/feedback.service.ts`

### Recipient Badge Always Showing "Tất cả"
- **Symptom**: Admin creates notification for "Phụ huynh" but UI shows "Tất cả"
- **Cause**: `target_role` not included in create DTO, not saved to DB, UI hardcoded
- **Fix**: Added `target_role` to CreateNotificationDto, UpdateNotificationDto, service create method, and UI rendering
- **Files**: DTOs, notification.service.ts, NotificationDialog.tsx, NotificationsPageClient.tsx

### Teacher Receiving Parent Notifications
- **Symptom**: Teacher sees parent-targeted notifications
- **Cause**: `me.controller.ts` called `findForParent()` for both roles
- **Fix**: Added `findForTeacher()` method, controller routes by `req.user.role`
- **File**: `notification.service.ts`, `me.controller.ts`

## Patterns to Reuse

### Table Page Pattern
```
PageClient → Header + FilterBar + Card(Table + PaginationBar)
```

### Dialog CRUD Pattern
```
Dialog (open/onOpenChange) → Form state → useMutation → invalidateQueries → toast
```

### Sidebar Badge Pattern
```
useQuery (fetch notifications) + useNotificationStatus (read IDs) → compute unreadCount
```
