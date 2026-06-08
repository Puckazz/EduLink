'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  defaultMajorFormValues,
  majorFormSchema,
  type MajorFormValues,
} from '@/components/majors/utils/major-form.schema';

interface MajorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMajor: Major | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function getFormFromMajor(major: Major): MajorFormValues {
  return {
    major_code: major.major_code,
    major_name: major.major_name,
  };
}

export function MajorDialog({ open, onOpenChange, editingMajor }: MajorDialogProps) {
  const isEditing = editingMajor !== null;
  const form = useForm<MajorFormValues>({
    resolver: zodResolver(majorFormSchema),
    defaultValues: defaultMajorFormValues,
  });

  const createMutation = useCreateMajor();
  const updateMutation = useUpdateMajor();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset(editingMajor ? getFormFromMajor(editingMajor) : defaultMajorFormValues);
    }
  }, [open, editingMajor, form]);

  const handleSubmit = (values: MajorFormValues) => {
    const dto: CreateMajorDto = {
      major_code: values.major_code,
      major_name: values.major_name,
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset(defaultMajorFormValues);
      }}
    >
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

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="major-code">
              Mã ngành học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-code"
              placeholder="Ví dụ: CNTT, DTVT..."
              {...form.register('major_code')}
              disabled={isPending}
              className="h-9 text-sm"
            />
            <FieldError message={form.formState.errors.major_code?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="major-name">
              Tên ngành học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="major-name"
              placeholder="Ví dụ: Công nghệ thông tin..."
              {...form.register('major_name')}
              disabled={isPending}
              className="h-9 text-sm"
            />
            <FieldError message={form.formState.errors.major_name?.message} />
          </div>
          </div>

          <DialogFooter>
            <Button
              id="major-dialog-cancel"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button id="major-dialog-submit" type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? 'Đang lưu...'
                  : 'Đang thêm...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Thêm ngành học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
