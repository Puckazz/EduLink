'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsLayout } from '@/components/shared/settings/SettingsLayout';
import { ProfileInfoForm } from '@/components/shared/settings/ProfileInfoForm';
import { ChangePasswordForm } from '@/components/shared/settings/ChangePasswordForm';
import { NotificationPreferencesForm } from '@/components/shared/settings/NotificationPreferencesForm';
import { Bell, KeyRound, ShieldCheck } from 'lucide-react';
import type { ParentProfile } from '@/types/auth';

const PARENT_NOTIF_CONFIGS = [
  {
    key: 'notif_score_new',
    label: 'Điểm mới được công bố',
    description: 'Nhận thông báo khi điểm số của con được cập nhật',
    defaultValue: true,
  },
  {
    key: 'notif_attendance_absent',
    label: 'Cảnh báo vắng mặt',
    description: 'Nhận thông báo khi con vắng mặt không phép',
    defaultValue: true,
  },
  {
    key: 'notif_feedback_reply',
    label: 'Phản hồi từ nhà trường',
    description: 'Nhận thông báo khi nhà trường trả lời phản hồi của bạn',
    defaultValue: true,
  },
  {
    key: 'notif_system',
    label: 'Thông báo chung từ trường',
    description: 'Nhận các thông báo tổng hợp từ nhà trường',
    defaultValue: true,
  },
];

export function ParentSettingsPageClient() {
  const { data: profile, isPending } = useCurrentUser();
  const parent = profile?.role === 'parent' ? (profile as ParentProfile) : null;

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[560px] rounded-xl" />
      </div>
    );
  }

  const sections = [
    {
      id: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: ShieldCheck,
      content: (
        <ProfileInfoForm
          title="Hồ sơ phụ huynh"
          subtitle="Cập nhật thông tin cá nhân và liên lạc của bạn."
          readonlyFields={[
            {
              label: 'Số điện thoại',
              value: parent?.phone || '—',
            },
          ]}
          editableFields={[
            {
              key: 'full_name',
              label: 'Họ và tên',
              placeholder: 'Nhập họ và tên',
            },
            {
              key: 'email',
              label: 'Email liên lạc',
              type: 'email',
              placeholder: 'Nhập địa chỉ email',
            },
          ]}
          initialValues={{
            full_name: parent?.full_name || '',
            email: parent?.email || '',
          }}
          currentAvatarUrl={parent?.avatar_url}
        />
      ),
    },
    {
      id: 'password',
      label: 'Đổi mật khẩu',
      icon: KeyRound,
      content: <ChangePasswordForm />,
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: Bell,
      content: <NotificationPreferencesForm configs={PARENT_NOTIF_CONFIGS} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý hồ sơ, mật khẩu và cài đặt thông báo tài khoản phụ huynh.
        </p>
      </div>
      <SettingsLayout sections={sections} />
    </div>
  );
}
