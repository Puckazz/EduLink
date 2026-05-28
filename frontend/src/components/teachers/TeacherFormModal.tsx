'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTeacherMutation } from '@/components/teachers/hooks/useCreateTeacherMutation';
import { useUpdateTeacherMutation } from '@/components/teachers/hooks/useUpdateTeacherMutation';
import {
  mapTeacherFormToCreateDto,
  mapTeacherFormToUpdateDto,
} from '@/components/teachers/mappers/teacher.mapper';
import { useTeacherFormModalStore } from '@/components/teachers/stores/useTeacherFormModalStore';
import {
  defaultTeacherFormValues,
  teacherFormSchema,
  type TeacherFormValues,
} from '@/components/teachers/utils/teacher-form.schema';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return fallback;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function TeacherFormModal() {
  const { isOpen, mode, editingTeacher, setOpen, closeModal } =
    useTeacherFormModalStore();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: defaultTeacherFormValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && editingTeacher) {
      form.reset({
        username: editingTeacher.username,
        password: '',
        full_name: editingTeacher.full_name,
        email: editingTeacher.email ?? '',
        phone: editingTeacher.phone ?? '',
      });
      return;
    }

    form.reset(defaultTeacherFormValues);
  }, [isOpen, mode, editingTeacher, form]);

  const createMutation = useCreateTeacherMutation({
    onSuccess: () => {
      toast.success('Thêm giảng viên thành công.');
      form.reset(defaultTeacherFormValues);
      closeModal();
    },
  });

  const updateMutation = useUpdateTeacherMutation({
    onSuccess: () => {
      toast.success('Cập nhật giảng viên thành công.');
      form.reset(defaultTeacherFormValues);
      closeModal();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      form.reset(defaultTeacherFormValues);
    }
  };

  const handleSubmit = async (values: TeacherFormValues) => {
    if (mode === 'create' && values.password.trim() === '') {
      form.setError('password', {
        message: 'Vui lòng nhập mật khẩu.',
      });
      return;
    }

    try {
      if (mode === 'edit' && editingTeacher) {
        await updateMutation.mutateAsync({
          teacherId: editingTeacher.teacher_id,
          data: mapTeacherFormToUpdateDto(values),
        });
        return;
      }

      await createMutation.mutateAsync(mapTeacherFormToCreateDto(values));
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          mode === 'edit'
            ? 'Không thể cập nhật giảng viên.'
            : 'Không thể tạo giảng viên mới.',
        ),
      );
    }
  };

  const title =
    mode === 'edit' ? 'Cập nhật giảng viên' : 'Thêm giảng viên mới';
  const description =
    mode === 'edit'
      ? 'Chỉnh sửa thông tin tài khoản giảng viên.'
      : 'Nhập thông tin cơ bản để tạo tài khoản giảng viên.';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="teacher_full_name">Họ và tên *</Label>
            <Input id="teacher_full_name" {...form.register('full_name')} />
            <FieldError message={form.formState.errors.full_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher_username">Tên đăng nhập *</Label>
            <Input id="teacher_username" {...form.register('username')} />
            <FieldError message={form.formState.errors.username?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher_email">Email</Label>
            <Input
              id="teacher_email"
              type="email"
              placeholder="teacher@edulink.edu.vn"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher_phone">Số điện thoại</Label>
            <Input id="teacher_phone" {...form.register('phone')} />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="teacher_password">
              Mật khẩu{' '}
              {mode === 'create' ? '*' : '(để trống nếu không thay đổi)'}
            </Label>
            <Input
              id="teacher_password"
              type="password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Spinner className="size-4" />}
              {mode === 'edit' ? 'Lưu thay đổi' : 'Tạo giảng viên'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
