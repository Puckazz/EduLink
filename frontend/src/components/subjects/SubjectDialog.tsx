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
import { useCreateSubject, useUpdateSubject } from '@/hooks/mutations/useSubjectMutations';
import type { Subject, CreateSubjectDto } from '@/types/subject';
import {
  defaultSubjectFormValues,
  subjectFormSchema,
  type SubjectFormValues,
} from '@/components/subjects/utils/subject-form.schema';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubject: Subject | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function getFormFromSubject(subject: Subject): SubjectFormValues {
  return {
    subject_code: subject.subject_code,
    subject_name: subject.subject_name,
    credit: subject.credit ? String(subject.credit) : '',
    major_id: subject.major_id ? String(subject.major_id) : '',
  };
}

export function SubjectDialog({ open, onOpenChange, editingSubject }: SubjectDialogProps) {
  const isEditing = editingSubject !== null;
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: defaultSubjectFormValues,
  });

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset(editingSubject ? getFormFromSubject(editingSubject) : defaultSubjectFormValues);
    }
  }, [open, editingSubject, form]);

  const handleSubmit = (values: SubjectFormValues) => {
    const dto: CreateSubjectDto = {
      subject_code: values.subject_code,
      subject_name: values.subject_name,
      credit: values.credit ? Number(values.credit) : undefined,
      major_id: values.major_id ? Number(values.major_id) : undefined,
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset(defaultSubjectFormValues);
      }}
    >
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

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-code">
              Mã môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-code"
              placeholder="Ví dụ: INT1306, MAT1101..."
              {...form.register('subject_code')}
              disabled={isPending}
              className="h-9 text-sm"
            />
            <FieldError message={form.formState.errors.subject_code?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-name">
              Tên môn học <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject-name"
              placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật..."
              {...form.register('subject_name')}
              disabled={isPending}
              className="h-9 text-sm"
            />
            <FieldError message={form.formState.errors.subject_name?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-credit">Số tín chỉ</Label>
            <Input
              id="subject-credit"
              type="number"
              min={1}
              max={10}
              placeholder="Ví dụ: 3"
              {...form.register('credit')}
              disabled={isPending}
              className="h-9 text-sm"
            />
            <FieldError message={form.formState.errors.credit?.message} />
          </div>
          </div>

          <DialogFooter>
            <Button
              id="subject-dialog-cancel"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button id="subject-dialog-submit" type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? 'Đang lưu...'
                  : 'Đang thêm...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Thêm môn học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
