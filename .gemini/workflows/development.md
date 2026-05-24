# Workflow: Build a New Feature (Full-Stack)

Dùng khi nhận yêu cầu tính năng mới cần cả backend lẫn frontend.

## Steps

### 1. Phân tích & Schema
- Xác định entity mới hay extend entity cũ
- Nếu cần schema mới: edit `schema.prisma` → `npx prisma migrate dev --name <name>` → `npx prisma generate`
- Xác định relations, required fields, optional fields

### 2. Backend (thứ tự bắt buộc)
```
DTO → Service → Controller → Module wiring
```
- `dto/create-{name}.dto.ts` — dùng `class-validator`
- `dto/update-{name}.dto.ts` — tất cả field optional
- `{name}.service.ts` — inject `PrismaService`, define `select` object
- `{name}.controller.ts` — `@Roles()`, `@ApiTags()`, endpoints
- Register trong `{name}.module.ts` và `app.module.ts`
- Build check: `npx nest build`

### 3. Frontend (thứ tự bắt buộc)
```
Type → Service → Hook → PageClient → Page entry
```
- `types/{name}.ts` — TS interface matching API response
- `services/{name}.service.ts` — axios calls
- `hooks/queries/use{Name}.ts` — react-query `useQuery`
- `hooks/mutations/use{Name}Mutations.ts` — react-query `useMutation`
- `components/{role}/{feature}/{Name}PageClient.tsx` — UI
- `app/(dashboard)/{role}/{feature}/page.tsx` — import PageClient
- Lint check: `npx eslint <file> --max-warnings=0`

### 4. Validate
- Test API via Swagger (`localhost:3001/api`)
- Check UI renders correct data
- Verify RBAC: admin/parent/teacher see correct data

---

# Workflow: Add an API Endpoint

Dùng khi cần thêm 1 endpoint vào module đã có.

### Steps
1. Thêm DTO nếu cần (create/update/query)
2. Thêm method vào Service
3. Thêm route vào Controller với `@Roles()` đúng
4. Thêm method vào `services/*.service.ts` ở frontend
5. Thêm/update react-query hook
6. Dùng hook trong component
7. Build + lint check

---

# Workflow: Fix a Bug

1. **Identify**: Đọc error message, xác định file/line
2. **Check memory**: Xem `.gemini/memory/decisions.md` — bug này đã fix chưa?
3. **Root cause**: Trace ngược từ symptom → service → DB
4. **Fix**: Minimal change, không break existing logic
5. **Validate**: Build backend, lint frontend
6. **Update memory**: Ghi vào `.gemini/memory/decisions.md` nếu là bug lặp lại

---

# Workflow: UI Refactor / Style Fix

1. Xác định component cần refactor
2. Đọc `.gemini/rules/frontend.md` — design tokens, layout patterns
3. Replace hardcoded colors với design tokens
4. Đảm bảo dùng shadcn components thay vì custom HTML
5. Check responsive: mobile → tablet → desktop
6. Lint check

---

# Workflow: Database Schema Change

```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Migration
cd backend
npx prisma migrate dev --name <descriptive-name>
npx prisma generate
# 3. Update DTO (add new fields)
# 4. Update service select object
# 5. Update frontend Type
# 6. Build
npx nest build
```

⚠️ **Rules**:
- New fields: always optional (`?`) or with `@default()`
- Never remove fields — mark deprecated first
- Test with existing data via Prisma Studio
