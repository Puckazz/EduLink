'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsLayout } from '@/components/shared/settings/SettingsLayout';
import { ProfileInfoForm } from '@/components/shared/settings/ProfileInfoForm';
import { ChangePasswordForm } from '@/components/shared/settings/ChangePasswordForm';
import { NotificationPreferencesForm } from '@/components/shared/settings/NotificationPreferencesForm';
import { Bell, KeyRound, ShieldCheck } from 'lucide-react';
import type { AdminProfile } from '@/types/auth';

const ADMIN_NOTIF_CONFIGS = [
  {
    key: 'notif_new_feedback',
    label: 'Phản hồi mới',
    description: 'Nhận thông báo khi có phản hồi mới từ phụ huynh cần xử lý',
    defaultValue: true,
  },
  {
    key: 'notif_score_published',
    label: 'Điểm được công bố',
    description: 'Nhận thông báo khi điểm số mới được cập nhật trong hệ thống',
    defaultValue: true,
  },
  {
    key: 'notif_attendance_alert',
    label: 'Cảnh báo điểm danh',
    description: 'Nhận thông báo khi sinh viên có nhiều buổi vắng liên tiếp',
    defaultValue: false,
  },
  {
    key: 'notif_system',
    label: 'Thông báo hệ thống',
    description: 'Nhận các thông báo quan trọng về hệ thống',
    defaultValue: true,
  },
];

export function AdminSettingsPageClient() {
  const { data: profile, isPending } = useCurrentUser();
  const admin = profile?.role === 'admin' ? (profile as AdminProfile) : null;

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
          title="Hồ sơ quản trị viên"
          subtitle="Cập nhật thông tin cá nhân của tài khoản quản trị."
          readonlyFields={[
            {
              label: 'Mã quản trị viên',
              value: admin ? `#${admin.admin_id}` : '—',
            },
            {
              label: 'Tên đăng nhập',
              value: admin?.username || '—',
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
              label: 'Email',
              type: 'email',
              placeholder: 'Nhập địa chỉ email',
            },
          ]}
          initialValues={{
            full_name: admin?.full_name || '',
            email: admin?.email || '',
          }}
          currentAvatarUrl={admin?.avatar_url}
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
      content: <NotificationPreferencesForm configs={ADMIN_NOTIF_CONFIGS} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý hồ sơ, mật khẩu và cài đặt thông báo quản trị viên.
        </p>
      </div>
      <SettingsLayout sections={sections} />
    </div>
  );
}
