'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSubject, useUpdateSubject } from '@/hooks/mutations/useSubjectMutations';
import type { Subject, CreateSubjectDto } from '@/types/subject';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubject: Subject | null;
}

const DEFAULT_FORM: CreateSubjectDto = {
  subject_code: '',
  subject_name: '',
  credit: undefined,
};

function getFormFromSubject(subject: Subject): CreateSubjectDto {
  return {
    subject_code: subject.subject_code,
    subject_name: subject.subject_name,
    credit: subject.credit ?? undefined,
  };
}

export function SubjectDialog({ open, onOpenChange, editingSubject }: SubjectDialogProps) {
  const isEditing = editingSubject !== null;
  const [form, setForm] = useState<CreateSubjectDto>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSubjectDto, string>>>({});

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setForm(editingSubject ? getFormFromSubject(editingSubject) : DEFAULT_FORM);
      setErrors({});
    }
  }, [open, editingSubject]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateSubjectDto, string>> = {};
    if (!form.subject_code.trim()) {
      newErrors.subject_code = 'Mã môn học không được để trống.';
    } else if (form.subject_code.trim().length > 20) {
      newErrors.subject_code = 'Mã môn học tối đa 20 ký tự.';
    }
    if (!form.subject_name.trim()) {
      newErrors.subject_name = 'Tên môn học không được để trống.';
    } else if (form.subject_name.trim().length > 100) {
      newErrors.subject_name = 'Tên môn học tối đa 100 ký tự.';
    }
    
    if (form.credit !== undefined && form.credit !== null) {
      const cr = Number(form.credit);
      if (isNaN(cr) || cr < 1 || cr > 10 || !Number.isInteger(cr)) {
        newErrors.credit = 'Số tín chỉ phải là số nguyên từ 1 đến 10.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dto: CreateSubjectDto = {
      subject_code: form.subject_code.trim(),
      subject_name: form.subject_name.trim(),
      credit: form.credit !== undefined && form.credit !== null && String(form.credit).trim() !== '' ? Number(form.credit) : undefined,
    };

    if (isEditing && editingSubject) {
      updateMutation.mutate(
        { id: editingSubject.subject_id, dto },
        {
          onSuccess: () => {
            toast.success('Cập nhật môn học thành công.');
            onOpenChange(false);
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể cập nhật môn học.';
            toast.error(msg);
          },
        },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          toast.success('Thêm môn học mới thành công.');
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể thêm môn học mới.';
          toast.error(msg);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin môn học này.'
              : 'Điền thông tin để tạo một môn học mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Subject Code */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-code">
              Mã môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-code"
              placeholder="Ví dụ: INT1306, MAT1101..."
              value={form.subject_code}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, subject_code: e.target.value }));
                if (errors.subject_code) setErrors((prev) => ({ ...prev, subject_code: undefined }));
              }}
              disabled={isPending}
              className="h-9 text-sm"
            />
            {errors.subject_code && (
              <p className="text-xs text-destructive">{errors.subject_code}</p>
            )}
          </div>

          {/* Subject Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-name">
              Tên môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-name"
              placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật..."
              value={form.subject_name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, subject_name: e.target.value }));
                if (errors.subject_name) setErrors((prev) => ({ ...prev, subject_name: undefined }));
              }}
              disabled={isPending}
              className="h-9 text-sm"
            />
            {errors.subject_name && (
              <p className="text-xs text-destructive">{errors.subject_name}</p>
            )}
          </div>

          {/* Credit */}
          <div className="flex flex-col gap-1.5">
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
                setForm((prev) => ({ ...prev, credit: val === '' ? undefined : Number(val) }));
                if (errors.credit) setErrors((prev) => ({ ...prev, credit: undefined }));
              }}
              disabled={isPending}
              className="h-9 text-sm"
            />
            {errors.credit && (
              <p className="text-xs text-destructive">{errors.credit}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            id="subject-dialog-cancel"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            id="subject-dialog-submit"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? isEditing
                ? 'Đang lưu...'
                : 'Đang thêm...'
              : isEditing
                ? 'Lưu thay đổi'
                : 'Thêm môn học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
