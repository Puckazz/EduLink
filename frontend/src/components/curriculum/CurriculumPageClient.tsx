'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { MajorService } from '@/services/major.service';
import { SubjectService } from '@/services/subject.service';
import type { Major, CreateMajorDto } from '@/types/major';
import type { Subject, CreateSubjectDto } from '@/types/subject';
import { normalizeText } from '@/utils';

// ─── Major Dialog ──────────────────────────────────────────────────────────────

interface MajorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMajor: Major | null;
  onSubmit: (dto: CreateMajorDto, id?: number) => void;
  isLoading: boolean;
}

function MajorDialog({
  open,
  onOpenChange,
  editingMajor,
  onSubmit,
  isLoading,
}: MajorDialogProps) {
  const isEditing = editingMajor !== null;
  const [form, setForm] = useState<CreateMajorDto>({ major_code: '', major_name: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMajorDto, string>>>({});

  // Sync form when dialog opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(
        editingMajor
          ? { major_code: editingMajor.major_code, major_name: editingMajor.major_name }
          : { major_code: '', major_name: '' },
      );
      setErrors({});
    }
    onOpenChange(next);
  };

  const validate = () => {
    const e: Partial<Record<keyof CreateMajorDto, string>> = {};
    if (!form.major_code.trim()) e.major_code = 'Mã ngành không được để trống.';
    else if (form.major_code.trim().length > 20) e.major_code = 'Tối đa 20 ký tự.';
    if (!form.major_name.trim()) e.major_name = 'Tên ngành không được để trống.';
    else if (form.major_name.trim().length > 100) e.major_name = 'Tối đa 100 ký tự.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(
      { major_code: form.major_code.trim(), major_name: form.major_name.trim() },
      editingMajor?.major_id,
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {isEditing ? 'Chỉnh sửa ngành học' : 'Thêm ngành học mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Cập nhật thông tin ngành học.' : 'Điền thông tin để tạo ngành học mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="major-code">
              Mã ngành <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-code"
              placeholder="Ví dụ: CNTT, DTVT..."
              value={form.major_code}
              onChange={(e) => {
                setForm((p) => ({ ...p, major_code: e.target.value }));
                if (errors.major_code) setErrors((p) => ({ ...p, major_code: undefined }));
              }}
              disabled={isLoading}
            />
            {errors.major_code && (
              <p className="text-xs text-destructive">{errors.major_code}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="major-name">
              Tên ngành học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-name"
              placeholder="Ví dụ: Công nghệ thông tin..."
              value={form.major_name}
              onChange={(e) => {
                setForm((p) => ({ ...p, major_name: e.target.value }));
                if (errors.major_name) setErrors((p) => ({ ...p, major_name: undefined }));
              }}
              disabled={isLoading}
            />
            {errors.major_name && (
              <p className="text-xs text-destructive">{errors.major_name}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button id="major-dialog-cancel" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button id="major-dialog-submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (isEditing ? 'Đang lưu...' : 'Đang thêm...') : isEditing ? 'Lưu thay đổi' : 'Thêm ngành học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subject Dialog ────────────────────────────────────────────────────────────

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubject: Subject | null;
  defaultMajorId?: number | null;
  majors: Major[];
  onSubmit: (dto: CreateSubjectDto, id?: number) => void;
  isLoading: boolean;
}

function SubjectDialog({
  open,
  onOpenChange,
  editingSubject,
  defaultMajorId,
  majors,
  onSubmit,
  isLoading,
}: SubjectDialogProps) {
  const isEditing = editingSubject !== null;
  const [form, setForm] = useState<CreateSubjectDto>({
    subject_code: '',
    subject_name: '',
    credit: undefined,
    major_id: defaultMajorId ?? null,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm(
        editingSubject
          ? {
              subject_code: editingSubject.subject_code,
              subject_name: editingSubject.subject_name,
              credit: editingSubject.credit ?? undefined,
              major_id: editingSubject.major_id ?? null,
            }
          : { subject_code: '', subject_name: '', credit: undefined, major_id: defaultMajorId ?? null },
      );
      setErrors({});
    }
    onOpenChange(next);
  };

  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    if (!form.subject_code.trim()) e.subject_code = 'Mã môn học không được để trống.';
    else if (form.subject_code.trim().length > 20) e.subject_code = 'Tối đa 20 ký tự.';
    if (!form.subject_name.trim()) e.subject_name = 'Tên môn học không được để trống.';
    else if (form.subject_name.trim().length > 100) e.subject_name = 'Tối đa 100 ký tự.';
    if (form.credit !== undefined && form.credit !== null) {
      const cr = Number(form.credit);
      if (isNaN(cr) || cr < 1 || cr > 10 || !Number.isInteger(cr)) {
        e.credit = 'Số tín chỉ phải là số nguyên từ 1 đến 10.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const dto: CreateSubjectDto = {
      subject_code: form.subject_code.trim(),
      subject_name: form.subject_name.trim(),
      credit:
        form.credit !== undefined && form.credit !== null && String(form.credit).trim() !== ''
          ? Number(form.credit)
          : undefined,
      major_id: form.major_id ?? null,
    };
    onSubmit(dto, editingSubject?.subject_id);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEditing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Cập nhật thông tin môn học.' : 'Điền thông tin để tạo môn học mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Major */}
          <div className="grid gap-1.5">
            <Label htmlFor="subject-major">Ngành học</Label>
            <Select
              value={form.major_id != null ? String(form.major_id) : '__none__'}
              onValueChange={(val) =>
                setForm((p) => ({ ...p, major_id: val === '__none__' ? null : Number(val) }))
              }
            >
              <SelectTrigger id="subject-major">
                <SelectValue placeholder="Chọn ngành học (tuỳ chọn)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Không thuộc ngành —</SelectItem>
                {majors.map((m) => (
                  <SelectItem key={m.major_id} value={String(m.major_id)}>
                    {m.major_code} – {m.major_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Code */}
          <div className="grid gap-1.5">
            <Label htmlFor="subject-code">
              Mã môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-code"
              placeholder="Ví dụ: INT1306, MAT1101..."
              value={form.subject_code}
              onChange={(e) => {
                setForm((p) => ({ ...p, subject_code: e.target.value }));
                if (errors.subject_code) setErrors((p) => ({ ...p, subject_code: undefined }));
              }}
              disabled={isLoading}
            />
            {errors.subject_code && <p className="text-xs text-destructive">{errors.subject_code}</p>}
          </div>

          {/* Subject Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="subject-name">
              Tên môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-name"
              placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật..."
              value={form.subject_name}
              onChange={(e) => {
                setForm((p) => ({ ...p, subject_name: e.target.value }));
                if (errors.subject_name) setErrors((p) => ({ ...p, subject_name: undefined }));
              }}
              disabled={isLoading}
            />
            {errors.subject_name && <p className="text-xs text-destructive">{errors.subject_name}</p>}
          </div>

          {/* Credit */}
          <div className="grid gap-1.5">
            <Label htmlFor="subject-credit">Số tín chỉ</Label>
            <Input
              id="subject-credit"
              type="number"
              min={1}
              max={10}
              placeholder="Ví dụ: 3"
              value={form.credit ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setForm((p) => ({ ...p, credit: val === '' ? undefined : Number(val) }));
                if (errors.credit) setErrors((p) => ({ ...p, credit: undefined }));
              }}
              disabled={isLoading}
            />
            {errors.credit && <p className="text-xs text-destructive">{errors.credit}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button id="subject-dialog-cancel" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button id="subject-dialog-submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isEditing ? 'Đang lưu...' : 'Đang thêm...'
              : isEditing ? 'Lưu thay đổi' : 'Thêm môn học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Major Row (expandable with subject children) ──────────────────────────────

interface MajorRowProps {
  major: Major;
  subjects: Subject[];
  defaultExpanded?: boolean;
  onEditMajor: (major: Major) => void;
  onDeleteMajor: (major: Major) => void;
  onAddSubject: (major: Major) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}

function MajorRow({
  major,
  subjects,
  defaultExpanded = false,
  onEditMajor,
  onDeleteMajor,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: MajorRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const scoreCountLabel = (count: number | undefined) =>
    `${count ?? 0} bản ghi điểm`;

  return (
    <>
      {/* Major row */}
      <tr className="group border-b border-border transition-colors hover:bg-muted/40">
        {/* Expand toggle + name */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <button
              id={`major-toggle-${major.major_id}`}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {major.major_code}
              </span>
              <span className="text-sm font-semibold text-foreground">{major.major_name}</span>
            </div>
            <Badge
              variant="secondary"
              className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground hover:bg-primary"
            >
              {subjects.length} môn
            </Badge>
          </div>
        </td>

        {/* Student count */}
        <td className="px-6 py-3.5 whitespace-nowrap">
          <Badge
            variant="outline"
            className="rounded-full border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 hover:bg-sky-50"
          >
            {major._count?.students ?? 0} sinh viên
          </Badge>
        </td>

        {/* Actions */}
        <td className="px-6 py-3.5 pr-4 text-right whitespace-nowrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id={`major-action-${major.major_id}`}
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                id={`major-edit-${major.major_id}`}
                onClick={() => onEditMajor(major)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                id={`major-add-subject-${major.major_id}`}
                onClick={() => onAddSubject(major)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm môn học
              </DropdownMenuItem>
              <DropdownMenuItem
                id={`major-delete-${major.major_id}`}
                onClick={() => onDeleteMajor(major)}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ngành học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Expanded subject rows */}
      {isExpanded && (
        <>
          {subjects.length === 0 ? (
            <tr className="border-b border-border bg-muted/20">
              <td colSpan={3} className="px-4 py-3 pl-14">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground italic">
                    Chưa có môn học nào.
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddSubject(major)}
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm môn học
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            subjects.map((subject, idx) => (
              <tr
                key={subject.subject_id}
                className={`group/subject bg-muted/20 transition-colors hover:bg-muted/40 ${
                  idx < subjects.length - 1 ? 'border-b border-border/60' : 'border-b border-border'
                }`}
              >
                {/* Subject name — indented */}
                <td className="py-2.5 pl-14 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {subject.subject_code}
                    </span>
                    <span className="text-sm text-foreground">{subject.subject_name}</span>
                    {subject.credit != null && (
                      <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        {subject.credit} TC
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Score count badge */}
                <td className="px-6 py-2.5 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground">
                    {scoreCountLabel(subject._count?.scores)}
                  </span>
                </td>

                {/* Subject actions */}
                <td className="px-6 py-2.5 pr-4 text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id={`subject-action-${subject.subject_id}`}
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        id={`subject-edit-${subject.subject_id}`}
                        onClick={() => onEditSubject(subject)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        id={`subject-delete-${subject.subject_id}`}
                        onClick={() => onDeleteSubject(subject)}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa môn học
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

// ─── Unassigned Subjects Section ───────────────────────────────────────────────

interface UnassignedSectionProps {
  subjects: Subject[];
  search: string;
  onSearchChange: (v: string) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}

function UnassignedSection({
  subjects,
  search,
  onSearchChange,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: UnassignedSectionProps) {
  const filtered = useMemo(() => {
    const q = normalizeText(search.trim());
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        normalizeText(s.subject_code).includes(q) ||
        normalizeText(s.subject_name).includes(q),
    );
  }, [subjects, search]);

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Môn học chưa thuộc ngành
          </h2>
          <Badge variant="outline" className="text-[10px]">
            {subjects.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="unassigned-subject-search"
              type="search"
              placeholder="Tìm môn học..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
              Xóa
            </Button>
          )}
          <Button id="add-unassigned-subject-btn" size="sm" className="h-8 gap-1.5" onClick={onAddSubject}>
            <Plus className="h-3.5 w-3.5" />
            Thêm môn học
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mã môn / Tên môn học
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Tín chỉ
                </th>
                <th className="w-24 whitespace-nowrap px-6 py-3 pr-4 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {subjects.length === 0
                          ? 'Tất cả môn học đều đã được gán ngành.'
                          : 'Không tìm thấy môn học phù hợp.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((subject, idx) => (
                  <tr
                    key={subject.subject_id}
                    className={`group transition-colors hover:bg-muted/50 ${
                      idx < filtered.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {subject.subject_code}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {subject.subject_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {subject.credit != null ? (
                        <Badge
                          variant="outline"
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                        >
                          {subject.credit} tín chỉ
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Chưa cấu hình</span>
                      )}
                    </td>
                    <td className="px-6 py-3 pr-4 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            id={`unassigned-subject-action-${subject.subject_id}`}
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            id={`unassigned-subject-edit-${subject.subject_id}`}
                            onClick={() => onEditSubject(subject)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            id={`unassigned-subject-delete-${subject.subject_id}`}
                            onClick={() => onDeleteSubject(subject)}
                            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa môn học
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export function CurriculumPageClient() {
  const queryClient = useQueryClient();

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [majorDialogOpen, setMajorDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [confirmMajorDelete, setConfirmMajorDelete] = useState<Major | null>(null);

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectDialogMajor, setSubjectDialogMajor] = useState<Major | null>(null);
  const [confirmSubjectDelete, setConfirmSubjectDelete] = useState<Subject | null>(null);

  // ── Search ────────────────────────────────────────────────────────────────
  const [majorSearch, setMajorSearch] = useState('');
  const [unassignedSearch, setUnassignedSearch] = useState('');

  // ── Queries ───────────────────────────────────────────────────────────────
  const majorsQuery = useQuery({
    queryKey: ['majors'],
    queryFn: () => MajorService.getAll(),
  });

  const subjectsQuery = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => SubjectService.getAll(),
  });

  const majorsData = majorsQuery.data;
  const subjectsData = subjectsQuery.data;

  const isLoading = majorsQuery.isPending || subjectsQuery.isPending;

  // Group subjects by major_id
  const subjectsByMajor = useMemo(() => {
    const subjects = subjectsData ?? [];
    const map = new Map<number, Subject[]>();
    for (const subject of subjects) {
      if (subject.major_id != null) {
        const list = map.get(subject.major_id) ?? [];
        list.push(subject);
        map.set(subject.major_id, list);
      }
    }
    return map;
  }, [subjectsData]);

  const unassignedSubjects = useMemo(
    () => (subjectsData ?? []).filter((s) => s.major_id == null),
    [subjectsData],
  );

  // Filter majors
  const filteredMajors = useMemo(() => {
    const majors = majorsData ?? [];
    const q = normalizeText(majorSearch.trim());
    if (!q) return majors;
    return majors.filter(
      (m) =>
        normalizeText(m.major_code).includes(q) ||
        normalizeText(m.major_name).includes(q),
    );
  }, [majorsData, majorSearch]);

  // Stable derived refs for JSX use (not used in hooks, no deps issue)
  const majors = majorsData ?? [];


  // ── Cache invalidation ────────────────────────────────────────────────────
  const invalidateAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['majors'] }),
      queryClient.invalidateQueries({ queryKey: ['subjects'] }),
    ]);

  // ── Major mutations ───────────────────────────────────────────────────────
  const createMajorMutation = useMutation({
    mutationFn: MajorService.create,
    onSuccess: async () => {
      await invalidateAll();
      setMajorDialogOpen(false);
      setEditingMajor(null);
      toast.success('Đã thêm ngành học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể thêm ngành học.');
    },
  });

  const updateMajorMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateMajorDto> }) =>
      MajorService.update(id, dto),
    onSuccess: async () => {
      await invalidateAll();
      setMajorDialogOpen(false);
      setEditingMajor(null);
      toast.success('Đã cập nhật ngành học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể cập nhật ngành học.');
    },
  });

  const deleteMajorMutation = useMutation({
    mutationFn: MajorService.delete,
    onSuccess: async () => {
      await invalidateAll();
      setConfirmMajorDelete(null);
      toast.success('Đã xóa ngành học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể xóa ngành học đang có sinh viên.');
    },
  });

  // ── Subject mutations ─────────────────────────────────────────────────────
  const createSubjectMutation = useMutation({
    mutationFn: SubjectService.create,
    onSuccess: async () => {
      await invalidateAll();
      setSubjectDialogOpen(false);
      setEditingSubject(null);
      setSubjectDialogMajor(null);
      toast.success('Đã thêm môn học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể thêm môn học.');
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateSubjectDto> }) =>
      SubjectService.update(id, dto),
    onSuccess: async () => {
      await invalidateAll();
      setSubjectDialogOpen(false);
      setEditingSubject(null);
      setSubjectDialogMajor(null);
      toast.success('Đã cập nhật môn học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể cập nhật môn học.');
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: SubjectService.delete,
    onSuccess: async () => {
      await invalidateAll();
      setConfirmSubjectDelete(null);
      toast.success('Đã xóa môn học.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không thể xóa môn học đang có điểm.');
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMajorSubmit = (dto: CreateMajorDto, id?: number) => {
    if (id !== undefined) {
      updateMajorMutation.mutate({ id, dto });
    } else {
      createMajorMutation.mutate(dto);
    }
  };

  const handleSubjectSubmit = (dto: CreateSubjectDto, id?: number) => {
    if (id !== undefined) {
      updateSubjectMutation.mutate({ id, dto });
    } else {
      createSubjectMutation.mutate(dto);
    }
  };

  const openAddSubjectForMajor = (major: Major) => {
    setEditingSubject(null);
    setSubjectDialogMajor(major);
    setSubjectDialogOpen(true);
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectDialogMajor(null);
    setSubjectDialogOpen(true);
  };

  const openAddUnassignedSubject = () => {
    setEditingSubject(null);
    setSubjectDialogMajor(null);
    setSubjectDialogOpen(true);
  };

  const isMajorPending = createMajorMutation.isPending || updateMajorMutation.isPending;
  const isSubjectPending = createSubjectMutation.isPending || updateSubjectMutation.isPending;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chương trình đào tạo
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý ngành học và các môn học thuộc từng ngành.
          </p>
        </div>

        <Button
          id="open-major-dialog-btn"
          className="shrink-0 gap-2"
          onClick={() => {
            setEditingMajor(null);
            setMajorDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Thêm ngành học
        </Button>
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative min-w-[260px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="major-search"
            type="search"
            placeholder="Tìm kiếm mã hoặc tên ngành học..."
            value={majorSearch}
            onChange={(e) => setMajorSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        {majorSearch && (
          <Button
            id="major-clear-search"
            variant="ghost"
            size="sm"
            onClick={() => setMajorSearch('')}
            className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* ── Main expandable table ── */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Ngành học / Môn học
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Sinh viên / Bảng điểm
                </th>
                <th className="w-24 whitespace-nowrap px-6 py-3.5 pr-4 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredMajors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {majors.length === 0
                          ? 'Chưa có ngành học nào.'
                          : 'Không tìm thấy ngành học phù hợp.'}
                      </p>
                      {majors.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setEditingMajor(null);
                            setMajorDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Tạo ngành học đầu tiên
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMajors.map((major, idx) => (
                  <MajorRow
                    key={major.major_id}
                    major={major}
                    subjects={subjectsByMajor.get(major.major_id) ?? []}
                    defaultExpanded={idx === 0}
                    onEditMajor={(m) => {
                      setEditingMajor(m);
                      setMajorDialogOpen(true);
                    }}
                    onDeleteMajor={setConfirmMajorDelete}
                    onAddSubject={openAddSubjectForMajor}
                    onEditSubject={openEditSubject}
                    onDeleteSubject={setConfirmSubjectDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Unassigned subjects section ── */}
      <UnassignedSection
        subjects={unassignedSubjects}
        search={unassignedSearch}
        onSearchChange={setUnassignedSearch}
        onAddSubject={openAddUnassignedSubject}
        onEditSubject={openEditSubject}
        onDeleteSubject={setConfirmSubjectDelete}
      />

      {/* ── Dialogs ── */}
      <MajorDialog
        open={majorDialogOpen}
        onOpenChange={(open) => {
          setMajorDialogOpen(open);
          if (!open) setEditingMajor(null);
        }}
        editingMajor={editingMajor}
        onSubmit={handleMajorSubmit}
        isLoading={isMajorPending}
      />

      <SubjectDialog
        open={subjectDialogOpen}
        onOpenChange={(open) => {
          setSubjectDialogOpen(open);
          if (!open) {
            setEditingSubject(null);
            setSubjectDialogMajor(null);
          }
        }}
        editingSubject={editingSubject}
        defaultMajorId={subjectDialogMajor?.major_id ?? null}
        majors={majors}
        onSubmit={handleSubjectSubmit}
        isLoading={isSubjectPending}
      />

      <ConfirmDialog
        open={!!confirmMajorDelete}
        title="Xóa ngành học"
        description={
          confirmMajorDelete
            ? `Bạn có chắc chắn muốn xóa ngành học "${confirmMajorDelete.major_name}"? Hành động này không thể hoàn tác và sẽ thất bại nếu ngành đang có sinh viên.`
            : 'Bạn có chắc chắn muốn xóa ngành học này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMajorMutation.isPending}
        onCancel={() => setConfirmMajorDelete(null)}
        onConfirm={() => {
          if (confirmMajorDelete) {
            deleteMajorMutation.mutate(confirmMajorDelete.major_id);
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmSubjectDelete}
        title="Xóa môn học"
        description={
          confirmSubjectDelete
            ? `Bạn có chắc chắn muốn xóa môn học "${confirmSubjectDelete.subject_name}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa môn học này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteSubjectMutation.isPending}
        onCancel={() => setConfirmSubjectDelete(null)}
        onConfirm={() => {
          if (confirmSubjectDelete) {
            deleteSubjectMutation.mutate(confirmSubjectDelete.subject_id);
          }
        }}
      />
    </div>
  );
}
