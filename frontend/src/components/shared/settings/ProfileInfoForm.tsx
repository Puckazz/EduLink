'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserRound, AtSign, Phone, BadgeCheck, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MeService, UpdateProfilePayload } from '@/services/me.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ProfileField {
  key: 'full_name' | 'email' | 'phone';
  label: string;
  icon: typeof UserRound;
  editable: boolean;
  type?: string;
  placeholder?: string;
}

export interface ProfileReadonlyField {
  icon: typeof UserRound;
  label: string;
  value: string;
}

interface ProfileInfoFormProps {
  readonlyFields: ProfileReadonlyField[];
  editableFields: ProfileField[];
  initialValues: Partial<Record<'full_name' | 'email' | 'phone', string>>;
  title?: string;
  subtitle?: string;
}

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  const message = apiError.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? 'Cập nhật thất bại.';
  if (typeof message === 'string') return message;
  return 'Cập nhật thất bại. Vui lòng thử lại.';
}

/** Row hiển thị giá trị readonly */
function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-border py-4 last:border-0">
      <span className="w-40 shrink-0 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** Row có label trái + input phải */
function FormRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-6 border-b border-border py-4 last:border-0">
      <Label
        htmlFor={htmlFor}
        className="w-40 shrink-0 pt-2.5 text-sm font-medium text-muted-foreground cursor-default"
      >
        {label}
      </Label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function ProfileInfoForm({
  readonlyFields,
  editableFields,
  initialValues,
  title = 'Hồ sơ cá nhân',
  subtitle = 'Cập nhật thông tin cá nhân của bạn.',
}: ProfileInfoFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Partial<Record<'full_name' | 'email' | 'phone', string>>>(
    initialValues,
  );

  // Đồng bộ khi profile refetch
  useEffect(() => {
    setValues({
      full_name: initialValues.full_name,
      email: initialValues.email,
      phone: initialValues.phone,
    });
  }, [initialValues.full_name, initialValues.email, initialValues.phone]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateProfilePayload) => MeService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Đã cập nhật hồ sơ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: UpdateProfilePayload = {};
    editableFields.forEach((f) => {
      const val = values[f.key];
      if (val !== undefined) payload[f.key] = val;
    });
    mutate(payload);
  }

  function handleCancel() {
    setValues({
      full_name: initialValues.full_name,
      email: initialValues.email,
      phone: initialValues.phone,
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Section header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-8 py-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={isPending}
            onClick={handleCancel}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            type="submit"
            form="settings-profile-form"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </div>

      {/* ── Form body ── */}
      <form
        id="settings-profile-form"
        onSubmit={handleSubmit}
        className="px-8 py-2"
      >
        {readonlyFields.map((field) => (
          <ReadonlyRow key={field.label} label={field.label} value={field.value} />
        ))}
        {editableFields.map((field) => (
          <FormRow key={field.key} label={field.label} htmlFor={`profile-${field.key}`}>
            <Input
              id={`profile-${field.key}`}
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
          </FormRow>
        ))}
      </form>
    </div>
  );
}

// Re-export icons for convenience
export { UserRound, AtSign, Phone, BadgeCheck };
