# Frontend Rules (Next.js 15 + Tailwind v4 + shadcn/ui)

## File Organization

```
components/{role}/{feature}/ComponentName.tsx   ← role-specific
components/shared/ComponentName.tsx             ← cross-role
components/notifications/ComponentName.tsx      ← cross-role notification system
components/ui/component.tsx                     ← shadcn primitives (DO NOT modify)
hooks/queries/useEntityName.ts                  ← react-query query hooks
hooks/mutations/useEntityMutation.ts            ← react-query mutation hooks
hooks/useFeatureName.ts                         ← custom state hooks
services/entity.service.ts                      ← API client
types/entity.ts                                 ← shared interfaces
```

## Component Patterns

### Page Components
- File: `components/{role}/{feature}/FeaturePageClient.tsx`
- Suffix: `PageClient` (because Next.js App Router pages are server components)
- Page entry: `app/(dashboard)/{role}/{feature}/page.tsx` → imports and renders `*PageClient`

### Component Rules
- Use `'use client'` directive at top for interactive components
- Props interface defined above component
- Export named functions, not default exports (except page.tsx)
- Keep components focused — extract sub-components when > 200 lines

## Styling (CRITICAL)

### Design Token Usage
```tsx
// ✅ CORRECT — uses design tokens
className="text-foreground bg-card border-border text-muted-foreground bg-muted"
className="bg-primary text-primary-foreground"
className="bg-destructive/10 text-destructive"

// ❌ WRONG — hardcoded colors
className="text-slate-900 bg-white border-gray-200 text-gray-500"
```

### Allowed Exceptions
- `bg-blue-500` / `bg-blue-50/40` — notification unread indicator
- `text-red-500` / `bg-red-500` — logout button, danger badge
- `text-emerald-500` — verified/success icon accent

### Typography Scale
- Page title: `text-2xl font-bold tracking-tight text-foreground`
- Section header: `text-base font-semibold text-foreground`
- Body text: `text-sm text-muted-foreground`
- Caption/meta: `text-[11px] text-muted-foreground`
- Badge text: `text-[10px] font-bold`

### Layout Patterns
- Page wrapper: `<div className="w-full space-y-6 pb-12">`
- Card container: `<Card className="border-border bg-card shadow-sm overflow-hidden">`
- Table in card: Card → `<div className="overflow-x-auto">` → `<table>` → PaginationBar
- Empty state: centered column with muted icon + message

## Data Fetching

### React Query
```tsx
// Query
const { data, isLoading } = useQuery<Type[]>({
  queryKey: ['entity-name'],
  queryFn: EntityService.getAll,
});

// Mutation
const mutation = useMutation({
  mutationFn: (data: CreateDto) => EntityService.create(data),
  onSuccess: () => {
    toast.success('Thành công');
    queryClient.invalidateQueries({ queryKey: ['entity-name'] });
  },
  onError: () => toast.error('Có lỗi xảy ra'),
});
```

### API Service Layer
```tsx
// services/entity.service.ts
export const EntityService = {
  async getAll(): Promise<Entity[]> {
    const res = await apiClient.get<Entity[]>('/entities');
    return res.data;
  },
  async create(data: CreateDto): Promise<Entity> {
    const res = await apiClient.post<Entity>('/entities', data);
    return res.data;
  },
};
```

## Shared Components Usage

| Component | Usage |
|-----------|-------|
| `PaginationBar` | Bottom of tables, requires `currentPage, totalPages, totalItems, pageSize, isBusy, onPageChange` |
| `Card` | Wrapper for content sections |
| `Select` | Dropdowns (sorting, filtering) — use shadcn Select, NOT custom dropdown |
| `Button` | All actions — use `variant="ghost"` for secondary, `variant="outline"` for tertiary |
| `Dialog` | Modals — use shadcn Dialog with `DialogHeader`, `DialogTitle`, `DialogContent` |
| `Tabs` | Tab interfaces — supports `variant="line"` for underlined style |
| `Input` | Form inputs — with `Search` icon for search bars |

## State Sync

For cross-component state (e.g., notification read status):
1. Persist in `localStorage`
2. Dispatch `CustomEvent` for same-tab sync
3. Listen to `storage` event for cross-tab sync
4. See `useNotificationStatus.ts` as reference pattern

## Internationalization
- All user-facing text in **Vietnamese**
- Date format: `vi-VN` locale (`toLocaleDateString('vi-VN', ...)`)
- Time format: `HH:mm` via `toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })`
