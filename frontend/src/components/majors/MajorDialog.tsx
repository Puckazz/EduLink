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
import { useCreateMajor, useUpdateMajor } from '@/hooks/mutations/useMajorMutations';
import type { Major, CreateMajorDto } from '@/types/major';

interface MajorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMajor: Major | null;
}

const DEFAULT_FORM: CreateMajorDto = {
  major_code: '',
  major_name: '',
};

function getFormFromMajor(major: Major): CreateMajorDto {
  return {
    major_code: major.major_code,
    major_name: major.major_name,
  };
}

export function MajorDialog({ open, onOpenChange, editingMajor }: MajorDialogProps) {
  const isEditing = editingMajor !== null;
  const [form, setForm] = useState<CreateMajorDto>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMajorDto, string>>>({});

  const createMutation = useCreateMajor();
  const updateMutation = useUpdateMajor();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setForm(editingMajor ? getFormFromMajor(editingMajor) : DEFAULT_FORM);
      setErrors({});
    }
  }, [open, editingMajor]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateMajorDto, string>> = {};
    if (!form.major_code.trim()) {
      newErrors.major_code = 'Mã ngành học không được để trống.';
    } else if (form.major_code.trim().length > 20) {
      newErrors.major_code = 'Mã ngành học tối đa 20 ký tự.';
    }
    if (!form.major_name.trim()) {
      newErrors.major_name = 'Tên ngành học không được để trống.';
    } else if (form.major_name.trim().length > 100) {
      newErrors.major_name = 'Tên ngành học tối đa 100 ký tự.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dto: CreateMajorDto = {
      major_code: form.major_code.trim(),
      major_name: form.major_name.trim(),
    };

    if (isEditing && editingMajor) {
      updateMutation.mutate(
        { id: editingMajor.major_id, dto },
        {
          onSuccess: () => {
            toast.success('Cập nhật ngành học thành công.');
            onOpenChange(false);
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể cập nhật ngành học.';
            toast.error(msg);
          },
        },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          toast.success('Thêm ngành học mới thành công.');
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể thêm ngành học mới.';
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
            {isEditing ? 'Chỉnh sửa ngành học' : 'Thêm ngành học mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin ngành học này.'
              : 'Điền thông tin để tạo một ngành học mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Major Code */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="major-code">
              Mã ngành học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-code"
              placeholder="Ví dụ: CNTT, DTVT..."
              value={form.major_code}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, major_code: e.target.value }));
                if (errors.major_code) setErrors((prev) => ({ ...prev, major_code: undefined }));
              }}
              disabled={isPending}
              className="h-9 text-sm"
            />
            {errors.major_code && (
              <p className="text-xs text-destructive">{errors.major_code}</p>
            )}
          </div>

          {/* Major Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="major-name">
              Tên ngành học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-name"
              placeholder="Ví dụ: Công nghệ thông tin..."
              value={form.major_name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, major_name: e.target.value }));
                if (errors.major_name) setErrors((prev) => ({ ...prev, major_name: undefined }));
              }}
              disabled={isPending}
              className="h-9 text-sm"
            />
            {errors.major_name && (
              <p className="text-xs text-destructive">{errors.major_name}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            id="major-dialog-cancel"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            id="major-dialog-submit"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? isEditing
                ? 'Đang lưu...'
                : 'Đang thêm...'
              : isEditing
                ? 'Lưu thay đổi'
                : 'Thêm ngành học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
