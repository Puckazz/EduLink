'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AcademicYearService,
  type CreateAcademicYearDto,
} from '@/services/academic-year.service';
import {
  AcademicTermService,
  type CreateAcademicTermDto,
} from '@/services/academic-term.service';
import type {
  AcademicPeriodStatus,
  AcademicTerm,
  AcademicTermCode,
  AcademicYear,
} from '@/types/academic-term';
import {
  ACADEMIC_STATUS_LABEL,
  TERM_CODE_LABEL,
  defaultAcademicYearDates,
  defaultTermDates,
  toDateInputValue,
} from '@/lib/academic-calendar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: AcademicPeriodStatus[] = ['UPCOMING', 'ONGOING', 'FINISHED'];
const TERM_CODES: AcademicTermCode[] = ['HK1', 'HK2', 'HKH'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStartYear(year?: AcademicYear | null) {
  if (!year) return new Date().getFullYear();
  const parsed = Number(year.name.slice(0, 4));
  return Number.isFinite(parsed) ? parsed : new Date(year.start_date).getFullYear();
}

function formatDate(value: string) {
  return toDateInputValue(value);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE_STYLES: Record<AcademicPeriodStatus, string> = {
  ONGOING:
    'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPCOMING:
    'bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400',
  FINISHED:
    'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400',
};

function AcademicStatusBadge({ status }: { status: AcademicPeriodStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_STYLES[status]}`}
    >
      {ACADEMIC_STATUS_LABEL[status]}
    </span>
  );
}

// ─── Inline Status Select ──────────────────────────────────────────────────────

function InlineStatusSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: AcademicPeriodStatus;
  onChange: (status: AcademicPeriodStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="h-auto w-auto gap-1 border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden"
      >
        <AcademicStatusBadge status={value} />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>
            {ACADEMIC_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Create Year Dialog ────────────────────────────────────────────────────────

interface CreateYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAcademicYearDto) => void;
  isLoading: boolean;
}

function CreateYearDialog({ open, onOpenChange, onSubmit, isLoading }: CreateYearDialogProps) {
  const startYear = new Date().getFullYear();
  const [form, setForm] = useState<CreateAcademicYearDto>(() => {
    const dates = defaultAcademicYearDates(startYear);
    return { name: `${startYear} - ${startYear + 1}`, ...dates, status: 'UPCOMING' };
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.warning('Vui lòng nhập tên năm học.');
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Tạo năm học mới
          </DialogTitle>
          <DialogDescription>Điền thông tin để tạo năm học mới trong hệ thống.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Tên năm học</label>
            <Input
              id="year-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="2025 - 2026"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Trạng thái</label>
            <Select
              value={form.status}
              onValueChange={(status: AcademicPeriodStatus) =>
                setForm((prev) => ({ ...prev, status }))
              }
            >
              <SelectTrigger id="year-status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ACADEMIC_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày bắt đầu</label>
              <Input
                id="year-start"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày kết thúc</label>
              <Input
                id="year-end"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            id="year-submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? 'Đang tạo…' : 'Tạo năm học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Term Dialog ────────────────────────────────────────────────────────

interface CreateTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAcademicTermDto) => void;
  activeYear: AcademicYear | null;
  isLoading: boolean;
}

function CreateTermDialog({
  open,
  onOpenChange,
  onSubmit,
  activeYear,
  isLoading,
}: CreateTermDialogProps) {
  const [form, setForm] = useState<CreateAcademicTermDto>({
    code: 'HK1',
    academic_year_id: 0,
    name: '',
    start_date: '',
    end_date: '',
    status: 'UPCOMING',
  });

  function fillDefaults(code: AcademicTermCode) {
    const startYear = getStartYear(activeYear);
    const dates = defaultTermDates(code, startYear);
    setForm((prev) => ({
      ...prev,
      code,
      name: activeYear ? `${TERM_CODE_LABEL[code]} - ${activeYear.name}` : '',
      ...dates,
    }));
  }

  const handleSubmit = () => {
    if (!activeYear) {
      toast.warning('Không xác định được năm học.');
      return;
    }
    onSubmit({ ...form, name: form.name?.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Thêm học kỳ
          </DialogTitle>
          <DialogDescription>
            {activeYear
              ? `Thêm học kỳ cho năm học ${activeYear.name}.`
              : 'Thêm học kỳ cho năm học đang chọn.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Loại học kỳ</label>
              <Select
                value={form.code}
                onValueChange={(code: AcademicTermCode) => fillDefaults(code)}
              >
                <SelectTrigger id="term-code">
                  <SelectValue placeholder="Loại học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {TERM_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {TERM_CODE_LABEL[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Trạng thái</label>
              <Select
                value={form.status}
                onValueChange={(status: AcademicPeriodStatus) =>
                  setForm((prev) => ({ ...prev, status }))
                }
              >
                <SelectTrigger id="term-status">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ACADEMIC_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Tên học kỳ</label>
            <Input
              id="term-name"
              value={form.name ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={activeYear ? `Học kỳ I - ${activeYear.name}` : 'Tên học kỳ'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày bắt đầu</label>
              <Input
                id="term-start"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày kết thúc</label>
              <Input
                id="term-end"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            id="term-submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isLoading ? 'Đang tạo…' : 'Thêm học kỳ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Year Dialog ─────────────────────────────────────────────────────────

interface EditYearDialogProps {
  year: AcademicYear | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: Partial<CreateAcademicYearDto>) => void;
  isLoading: boolean;
}

function EditYearDialog({ year, open, onOpenChange, onSubmit, isLoading }: EditYearDialogProps) {
  const [form, setForm] = useState<Partial<CreateAcademicYearDto>>({});

  const currentForm = year
    ? {
        name: form.name ?? year.name,
        start_date: form.start_date ?? toDateInputValue(year.start_date),
        end_date: form.end_date ?? toDateInputValue(year.end_date),
        status: form.status ?? year.status,
      }
    : form;

  const handleSubmit = () => {
    if (!year) return;
    if (!currentForm.name?.trim()) {
      toast.warning('Vui lòng nhập tên năm học.');
      return;
    }
    onSubmit(year.academic_year_id, currentForm);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setForm({});
    onOpenChange(nextOpen);
  };

  if (!year) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Chỉnh sửa năm học
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin năm học {year.name}.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Tên năm học</label>
            <Input
              id="edit-year-name"
              value={currentForm.name ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="2025 - 2026"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Trạng thái</label>
            <Select
              value={currentForm.status}
              onValueChange={(status: AcademicPeriodStatus) =>
                setForm((prev) => ({ ...prev, status }))
              }
            >
              <SelectTrigger id="edit-year-status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ACADEMIC_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày bắt đầu</label>
              <Input
                id="edit-year-start"
                type="date"
                value={currentForm.start_date ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày kết thúc</label>
              <Input
                id="edit-year-end"
                type="date"
                value={currentForm.end_date ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            id="edit-year-submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Term Dialog ──────────────────────────────────────────────────────────

interface EditTermDialogProps {
  term: AcademicTerm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: Partial<CreateAcademicTermDto>) => void;
  isLoading: boolean;
}

function EditTermDialog({ term, open, onOpenChange, onSubmit, isLoading }: EditTermDialogProps) {
  const [form, setForm] = useState<Partial<CreateAcademicTermDto>>({});

  const currentForm = term
    ? {
        name: form.name ?? term.name ?? '',
        start_date: form.start_date ?? toDateInputValue(term.start_date),
        end_date: form.end_date ?? toDateInputValue(term.end_date),
        status: form.status ?? term.status,
        code: form.code ?? term.code,
      }
    : form;

  const handleSubmit = () => {
    if (!term) return;
    onSubmit(term.term_id, {
      ...currentForm,
      name: currentForm.name?.toString().trim() || undefined,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setForm({});
    onOpenChange(nextOpen);
  };

  if (!term) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Chỉnh sửa học kỳ
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin học kỳ {term.name}.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Loại học kỳ</label>
              <Select
                value={currentForm.code}
                onValueChange={(code: AcademicTermCode) =>
                  setForm((prev) => ({ ...prev, code }))
                }
              >
                <SelectTrigger id="edit-term-code">
                  <SelectValue placeholder="Loại học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {TERM_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {TERM_CODE_LABEL[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Trạng thái</label>
              <Select
                value={currentForm.status}
                onValueChange={(status: AcademicPeriodStatus) =>
                  setForm((prev) => ({ ...prev, status }))
                }
              >
                <SelectTrigger id="edit-term-status">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ACADEMIC_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">Tên học kỳ</label>
            <Input
              id="edit-term-name"
              value={currentForm.name ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Học kỳ I - 2025-2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày bắt đầu</label>
              <Input
                id="edit-term-start"
                type="date"
                value={currentForm.start_date ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">Ngày kết thúc</label>
              <Input
                id="edit-term-end"
                type="date"
                value={currentForm.end_date ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            id="edit-term-submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Year Row (with expandable terms) ────────────────────────────────────────

interface YearRowProps {
  year: AcademicYear;
  terms: AcademicTerm[];
  defaultExpanded?: boolean;
  onUpdateYear: (year: AcademicYear, data: Partial<CreateAcademicYearDto>) => void;
  onDeleteYear: (year: AcademicYear) => void;
  onEditYear: (year: AcademicYear) => void;
  onUpdateTerm: (term: AcademicTerm, data: Partial<CreateAcademicTermDto>) => void;
  onDeleteTerm: (term: AcademicTerm) => void;
  onEditTerm: (term: AcademicTerm) => void;
  onAddTerm: (year: AcademicYear) => void;
}

function YearRow({
  year,
  terms,
  defaultExpanded = false,
  onUpdateYear,
  onDeleteYear,
  onEditYear,
  onUpdateTerm,
  onDeleteTerm,
  onEditTerm,
  onAddTerm,
}: YearRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <>
      {/* Year row */}
      <tr className="group border-b border-border transition-colors hover:bg-muted/40">
        {/* Expand toggle + name */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <button
              id={`year-toggle-${year.academic_year_id}`}
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <span className="text-sm font-semibold text-foreground">{year.name}</span>
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {terms.length} học kỳ
            </Badge>
          </div>
        </td>

        {/* Date range */}
        <td className="px-6 py-3.5 whitespace-nowrap">
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatDate(year.start_date)} → {formatDate(year.end_date)}
          </span>
        </td>

        {/* Status */}
        <td className="px-6 py-3.5 whitespace-nowrap">
          <InlineStatusSelect
            id={`year-status-${year.academic_year_id}`}
            value={year.status}
            onChange={(status) => onUpdateYear(year, { status })}
          />
        </td>

        {/* Actions */}
        <td className="px-6 py-3.5 pr-4 text-right whitespace-nowrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id={`year-action-${year.academic_year_id}`}
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                id={`year-edit-${year.academic_year_id}`}
                onClick={() => onEditYear(year)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                id={`year-add-term-${year.academic_year_id}`}
                onClick={() => onAddTerm(year)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm học kỳ
              </DropdownMenuItem>
              <DropdownMenuItem
                id={`year-delete-${year.academic_year_id}`}
                onClick={() => onDeleteYear(year)}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa năm học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Expanded term rows */}
      {isExpanded && (
        <>
          {terms.length === 0 ? (
            <tr className="border-b border-border bg-muted/20">
              <td colSpan={4} className="px-4 py-3 pl-14">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground italic">
                    Chưa có học kỳ nào.
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddTerm(year)}
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm học kỳ
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            terms.map((term, termIdx) => (
              <tr
                key={term.term_id}
                className={`group/term bg-muted/20 transition-colors hover:bg-muted/40 ${
                  termIdx < terms.length - 1 ? 'border-b border-border/60' : 'border-b border-border'
                }`}
              >
                {/* Term name — indented */}
                <td className="py-2.5 pl-14 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm text-foreground">{term.name}</span>
                  </div>
                </td>

                {/* Term date range */}
                <td className="px-6 py-2.5 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(term.start_date)} → {formatDate(term.end_date)}
                  </span>
                </td>

                {/* Term status */}
                <td className="px-6 py-2.5 whitespace-nowrap">
                  <InlineStatusSelect
                    id={`term-status-${term.term_id}`}
                    value={term.status}
                    onChange={(status) => onUpdateTerm(term, { status })}
                  />
                </td>

                {/* Term actions */}
                <td className="px-6 py-2.5 pr-4 text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id={`term-action-${term.term_id}`}
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover/term:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        id={`term-edit-${term.term_id}`}
                        onClick={() => onEditTerm(term)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        id={`term-delete-${term.term_id}`}
                        onClick={() => onDeleteTerm(term)}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa học kỳ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </>
      )}
    </>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export function AcademicCalendarPageClient() {
  const queryClient = useQueryClient();

  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const [termDialogYear, setTermDialogYear] = useState<AcademicYear | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [confirmYearDelete, setConfirmYearDelete] = useState<AcademicYear | null>(null);
  const [confirmTermDelete, setConfirmTermDelete] = useState<AcademicTerm | null>(null);

  // ── Data queries ──────────────────────────────────────────────────────────

  const yearsQuery = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => AcademicYearService.getAll(),
  });

  const termsQuery = useQuery({
    queryKey: ['academic-terms', 'all'],
    queryFn: () => AcademicTermService.getAll(),
  });

  const sortedYears = useMemo(
    () =>
      [...(yearsQuery.data ?? [])].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      ),
    [yearsQuery.data],
  );

  // Group terms by academic_year_id
  const termsByYear = useMemo(() => {
    const map = new Map<number, AcademicTerm[]>();
    for (const term of termsQuery.data ?? []) {
      const list = map.get(term.academic_year_id) ?? [];
      list.push(term);
      map.set(term.academic_year_id, list);
    }
    return map;
  }, [termsQuery.data]);

  // ── Cache invalidation ────────────────────────────────────────────────────

  const invalidateCalendar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['academic-years'] }),
      queryClient.invalidateQueries({ queryKey: ['academic-terms'] }),
    ]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createYearMutation = useMutation({
    mutationFn: AcademicYearService.create,
    onSuccess: async () => {
      await invalidateCalendar();
      setIsYearDialogOpen(false);
      toast.success('Đã tạo năm học.');
    },
    onError: () => toast.error('Không thể tạo năm học.'),
  });

  const updateYearMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<CreateAcademicYearDto> }) =>
      AcademicYearService.update(payload.id, payload.data),
    onSuccess: async () => {
      await invalidateCalendar();
      setEditingYear(null);
      toast.success('Đã cập nhật năm học.');
    },
    onError: () => toast.error('Không thể cập nhật năm học.'),
  });

  const deleteYearMutation = useMutation({
    mutationFn: AcademicYearService.delete,
    onSuccess: async () => {
      await invalidateCalendar();
      setConfirmYearDelete(null);
      toast.success('Đã xóa năm học.');
    },
    onError: () => toast.error('Không thể xóa năm học đã có học kỳ.'),
  });

  const createTermMutation = useMutation({
    mutationFn: AcademicTermService.create,
    onSuccess: async () => {
      await invalidateCalendar();
      setTermDialogYear(null);
      toast.success('Đã thêm học kỳ.');
    },
    onError: () => toast.error('Không thể tạo học kỳ.'),
  });

  const updateTermMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<CreateAcademicTermDto> }) =>
      AcademicTermService.update(payload.id, payload.data),
    onSuccess: async () => {
      await invalidateCalendar();
      setEditingTerm(null);
      toast.success('Đã cập nhật học kỳ.');
    },
    onError: () => toast.error('Không thể cập nhật học kỳ.'),
  });

  const deleteTermMutation = useMutation({
    mutationFn: AcademicTermService.delete,
    onSuccess: async () => {
      await invalidateCalendar();
      setConfirmTermDelete(null);
      toast.success('Đã xóa học kỳ.');
    },
    onError: () => toast.error('Không thể xóa học kỳ đã có dữ liệu.'),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCreateTerm(data: CreateAcademicTermDto) {
    if (!termDialogYear) return;
    createTermMutation.mutate({ ...data, academic_year_id: termDialogYear.academic_year_id });
  }

  const isLoading = yearsQuery.isPending || termsQuery.isPending;
  const newestYear = sortedYears[0] ?? null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Năm học &amp; học kỳ
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý lịch học vụ dùng chung cho điểm, điểm danh và thời khóa biểu.
          </p>
        </div>

        <Button
          id="open-year-dialog-btn"
          className="shrink-0 gap-2"
          onClick={() => setIsYearDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Thêm năm học
        </Button>
      </div>

      {/* ── Combined Table Card ── */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Năm học / Học kỳ
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Thời gian
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="px-6 py-3.5 pr-4 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap w-16">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : sortedYears.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Chưa có năm học nào.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsYearDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Tạo năm học đầu tiên
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedYears.map((year) => (
                  <YearRow
                    key={year.academic_year_id}
                    year={year}
                    terms={termsByYear.get(year.academic_year_id) ?? []}
                    defaultExpanded={year.academic_year_id === newestYear?.academic_year_id}
                    onUpdateYear={(y, data) =>
                      updateYearMutation.mutate({ id: y.academic_year_id, data })
                    }
                    onDeleteYear={setConfirmYearDelete}
                    onEditYear={setEditingYear}
                    onUpdateTerm={(term, data) =>
                      updateTermMutation.mutate({ id: term.term_id, data })
                    }
                    onDeleteTerm={setConfirmTermDelete}
                    onEditTerm={setEditingTerm}
                    onAddTerm={(y) => setTermDialogYear(y)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Dialogs ── */}
      <CreateYearDialog
        open={isYearDialogOpen}
        onOpenChange={setIsYearDialogOpen}
        onSubmit={(data) => createYearMutation.mutate(data)}
        isLoading={createYearMutation.isPending}
      />

      <CreateTermDialog
        open={!!termDialogYear}
        onOpenChange={(open) => { if (!open) setTermDialogYear(null); }}
        onSubmit={handleCreateTerm}
        activeYear={termDialogYear}
        isLoading={createTermMutation.isPending}
      />

      <EditYearDialog
        year={editingYear}
        open={!!editingYear}
        onOpenChange={(open) => { if (!open) setEditingYear(null); }}
        onSubmit={(id, data) => updateYearMutation.mutate({ id, data })}
        isLoading={updateYearMutation.isPending}
      />

      <EditTermDialog
        term={editingTerm}
        open={!!editingTerm}
        onOpenChange={(open) => { if (!open) setEditingTerm(null); }}
        onSubmit={(id, data) => updateTermMutation.mutate({ id, data })}
        isLoading={updateTermMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirmYearDelete}
        title="Xóa năm học"
        description={
          confirmYearDelete
            ? `Bạn có chắc chắn muốn xóa năm học "${confirmYearDelete.name}"? Hành động này không thể hoàn tác và sẽ thất bại nếu năm học đã có học kỳ.`
            : 'Bạn có chắc chắn muốn xóa năm học này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteYearMutation.isPending}
        onCancel={() => setConfirmYearDelete(null)}
        onConfirm={() => {
          if (confirmYearDelete) {
            deleteYearMutation.mutate(confirmYearDelete.academic_year_id);
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmTermDelete}
        title="Xóa học kỳ"
        description={
          confirmTermDelete
            ? `Bạn có chắc chắn muốn xóa học kỳ "${confirmTermDelete.name}"? Hành động này không thể hoàn tác và sẽ thất bại nếu học kỳ đã có dữ liệu.`
            : 'Bạn có chắc chắn muốn xóa học kỳ này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteTermMutation.isPending}
        onCancel={() => setConfirmTermDelete(null)}
        onConfirm={() => {
          if (confirmTermDelete) {
            deleteTermMutation.mutate(confirmTermDelete.term_id);
          }
        }}
      />
    </div>
  );
}
