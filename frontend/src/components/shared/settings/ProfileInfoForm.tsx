'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, Camera, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MeService } from '@/services/me.service';
import type { UpdateProfilePayload } from '@/types/me';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ProfileField {
  key: 'full_name' | 'email' | 'phone';
  label: string;
  type?: string;
  placeholder?: string;
}

export interface ProfileReadonlyField {
  label: string;
  value: string;
}

interface ProfileInfoFormProps {
  readonlyFields: ProfileReadonlyField[];
  editableFields: ProfileField[];
  initialValues: Partial<Record<'full_name' | 'email' | 'phone', string>>;
  currentAvatarUrl?: string | null;
  title?: string;
  subtitle?: string;
}

interface PendingAvatar {
  url: string;
  publicId: string;
}

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  const message = apiError.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? 'Cập nhật thất bại.';
  if (typeof message === 'string') return message;
  return 'Cập nhật thất bại. Vui lòng thử lại.';
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-border py-4 last:border-0">
      <span className="w-40 shrink-0 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="flex-1 text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

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
  currentAvatarUrl,
  title = 'Hồ sơ cá nhân',
  subtitle = 'Cập nhật thông tin cá nhân của bạn.',
}: ProfileInfoFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAvatar, setPendingAvatar] = useState<PendingAvatar | null>(null);
  const [values, setValues] = useState<Partial<Record<'full_name' | 'email' | 'phone', string>>>(
    initialValues,
  );

  const avatarUrl = pendingAvatar?.url ?? currentAvatarUrl ?? null;
  const initials = (initialValues.full_name ?? 'U').slice(0, 1).toUpperCase();
  const formResetKey = [
    currentAvatarUrl ?? '',
    initialValues.full_name ?? '',
    initialValues.email ?? '',
    initialValues.phone ?? '',
  ].join('::');

  useEffect(() => {
    setValues({
      full_name: initialValues.full_name,
      email: initialValues.email,
      phone: initialValues.phone,
    });
    setPendingAvatar(null);
  }, [formResetKey, initialValues]);

  const avatarMutation = useMutation({
    mutationFn: (file: File) => MeService.uploadAvatar(file),
    onSuccess: (result) => {
      setPendingAvatar(result);
      toast.success('Ảnh đại diện đã sẵn sàng. Bấm Lưu để áp dụng.');
    },
    onError: () => {
      toast.error('Không thể upload ảnh. Vui lòng thử lại.');
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: (publicId: string) => MeService.deleteAvatar(publicId),
  });

  async function discardPendingAvatar(showToast = false) {
    if (!pendingAvatar?.publicId) return;

    try {
      await deleteAvatarMutation.mutateAsync(pendingAvatar.publicId);
      setPendingAvatar(null);
      if (showToast) {
        toast.success('Đã xóa ảnh tạm.');
      }
    } catch {
      toast.error('Không thể xóa ảnh tạm. Vui lòng thử lại.');
      throw new Error('DELETE_PENDING_AVATAR_FAILED');
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
      return;
    }

    const previousPendingAvatar = pendingAvatar;

    if (previousPendingAvatar?.publicId) {
      try {
        await discardPendingAvatar();
      } catch {
        return;
      }
    }

    avatarMutation.mutate(file, {
      onError: () => {
        if (previousPendingAvatar) {
          setPendingAvatar(previousPendingAvatar);
        }
      },
    });

    e.target.value = '';
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateProfilePayload) => MeService.updateProfile(data),
    onSuccess: () => {
      setPendingAvatar(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
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
    if (pendingAvatar) {
      payload.avatar_url = pendingAvatar.url;
    }
    mutate(payload);
  }

  async function handleCancel() {
    if (pendingAvatar?.publicId) {
      try {
        await discardPendingAvatar();
      } catch {
        return;
      }
    }

    setValues({
      full_name: initialValues.full_name,
      email: initialValues.email,
      phone: initialValues.phone,
    });
  }

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex items-center gap-5 border-b border-border px-8 py-5">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-amber-200 to-orange-400 text-2xl font-bold text-orange-900">
                {initials}
              </div>
            )}
          </div>
          {pendingAvatar && (
            <button
              type="button"
              aria-label="Xóa ảnh tạm"
              className="absolute -right-1 -top-1 rounded-full border border-border bg-card p-1 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              disabled={avatarMutation.isPending || deleteAvatarMutation.isPending || isPending}
              onClick={() => {
                void discardPendingAvatar(true);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {(avatarMutation.isPending || deleteAvatarMutation.isPending) && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Ảnh đại diện</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP hoặc GIF. Tối đa 5MB.</p>
          <Button
            id="avatar-upload-btn"
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 mt-1"
            disabled={avatarMutation.isPending || deleteAvatarMutation.isPending || isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5" />
            Đổi ảnh
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

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
