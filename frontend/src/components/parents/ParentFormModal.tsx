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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateParentMutation } from '@/components/parents/hooks/useCreateParentMutation';
import { useUpdateParentMutation } from '@/components/parents/hooks/useUpdateParentMutation';
import {
  mapParentFormToCreateDto,
  mapParentFormToUpdateDto,
} from '@/components/parents/mappers/parent.mapper';
import { useParentFormModalStore } from '@/components/parents/stores/useParentFormModalStore';
import {
  defaultParentFormValues,
  parentFormSchema,
  type ParentFormValues,
} from '@/components/parents/utils/parent-form.schema';

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

export function ParentFormModal() {
  const { isOpen, mode, editingParent, setOpen, closeModal } =
    useParentFormModalStore();

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: defaultParentFormValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && editingParent) {
      form.reset({
        full_name: editingParent.full_name,
        phone: editingParent.phone,
        email: editingParent.email ?? '',
        username: editingParent.username ?? '',
        password: '',
        relationship: editingParent.relationship,
      });
      return;
    }

    form.reset(defaultParentFormValues);
  }, [isOpen, mode, editingParent, form]);

  const createMutation = useCreateParentMutation({
    onSuccess: () => {
      toast.success('Thêm phụ huynh thành công.');
      form.reset(defaultParentFormValues);
      closeModal();
    },
  });

  const updateMutation = useUpdateParentMutation({
    onSuccess: () => {
      toast.success('Cập nhật phụ huynh thành công.');
      form.reset(defaultParentFormValues);
      closeModal();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      form.reset(defaultParentFormValues);
    }
  };

  const handleSubmit = async (values: ParentFormValues) => {
    try {
      if (mode === 'edit' && editingParent) {
        await updateMutation.mutateAsync({
          parentId: editingParent.parent_id,
          data: mapParentFormToUpdateDto(values),
        });
        return;
      }

      await createMutation.mutateAsync(mapParentFormToCreateDto(values));
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          mode === 'edit'
            ? 'Không thể cập nhật phụ huynh.'
            : 'Không thể tạo phụ huynh mới.',
        ),
      );
    }
  };

  const title = mode === 'edit' ? 'Cập nhật phụ huynh' : 'Thêm phụ huynh mới';
  const description =
    mode === 'edit'
      ? 'Chỉnh sửa thông tin tài khoản phụ huynh.'
      : 'Nhập thông tin cơ bản để tạo tài khoản phụ huynh.';

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
            <Label htmlFor="full_name">Họ và tên *</Label>
            <Input id="full_name" {...form.register('full_name')} />
            <FieldError message={form.formState.errors.full_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input id="phone" {...form.register('phone')} />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@edulink.edu.vn"
              {...form.register('email')}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input id="username" {...form.register('username')} />
            <FieldError message={form.formState.errors.username?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Mối quan hệ</Label>
            <Select
              value={form.watch('relationship')}
              onValueChange={(value) => {
                form.setValue(
                  'relationship',
                  value as ParentFormValues['relationship'],
                  {
                    shouldDirty: true,
                  },
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mối quan hệ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHA">Cha</SelectItem>
                <SelectItem value="ME">Mẹ</SelectItem>
                <SelectItem value="NGUOI_GIAM_HO">Người giám hộ</SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={form.formState.errors.relationship?.message} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password">
              Mật khẩu{' '}
              {mode === 'create' ? '*' : '(để trống nếu không thay đổi)'}
            </Label>
            <Input
              id="password"
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
              {mode === 'edit' ? 'Lưu thay đổi' : 'Tạo phụ huynh'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
