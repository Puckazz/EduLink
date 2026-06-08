'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  changePasswordFormSchema,
  defaultChangePasswordFormValues,
  type ChangePasswordFormValues,
} from '@/components/shared/settings/utils/change-password-form.schema';

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  const message = apiError.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? 'Đổi mật khẩu thất bại.';
  if (typeof message === 'string') return message;
  return 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
}

/** Row có label trái + input phải */
function FormRow({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-6 border-b border-border py-4 last:border-0">
      <Label
        htmlFor={htmlFor}
        className="w-40 shrink-0 pt-2.5 text-sm font-medium text-muted-foreground cursor-default"
      >
        {label}
      </Label>
      <div className="flex-1 min-w-0 space-y-1">
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: defaultChangePasswordFormValues,
  });
  const [isSaving, setIsSaving] = useState(false);

  function handleCancel() {
    form.reset(defaultChangePasswordFormValues);
  }

  async function handleSubmit(values: ChangePasswordFormValues) {
    setIsSaving(true);
    try {
      const result = await AuthService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      handleCancel();
      toast.success(result.message || 'Đã đổi mật khẩu thành công.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Section header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-8 py-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Đổi mật khẩu</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cập nhật mật khẩu đăng nhập của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={handleCancel}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            type="submit"
            form="settings-password-form"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </div>
      </div>

      {/* ── Form body ── */}
      <form
        id="settings-password-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="px-8 py-2"
      >
        <FormRow label="Mật khẩu hiện tại" htmlFor="oldPassword">
          <Input
            id="oldPassword"
            type="password"
            autoComplete="current-password"
            {...form.register('oldPassword')}
          />
          <FieldError message={form.formState.errors.oldPassword?.message} />
        </FormRow>
        <FormRow
          label="Mật khẩu mới"
          htmlFor="newPassword"
          hint="Mật khẩu mới cần tối thiểu 6 ký tự."
        >
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...form.register('newPassword')}
          />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </FormRow>
        <FormRow label="Xác nhận mật khẩu" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </FormRow>
      </form>
    </div>
  );
}
