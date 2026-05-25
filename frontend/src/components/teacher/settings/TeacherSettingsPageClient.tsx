'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsLayout } from '@/components/shared/settings/SettingsLayout';
import { ProfileInfoForm } from '@/components/shared/settings/ProfileInfoForm';
import { ChangePasswordForm } from '@/components/shared/settings/ChangePasswordForm';
import { NotificationPreferencesForm } from '@/components/shared/settings/NotificationPreferencesForm';
import { Bell, KeyRound, ShieldCheck } from 'lucide-react';
import type { TeacherProfile } from '@/types/auth';

const TEACHER_NOTIF_CONFIGS = [
  {
    key: 'notif_attendance_reminder',
    label: 'Nhắc nhở điểm danh',
    description: 'Nhận thông báo trước buổi học cần điểm danh',
    defaultValue: true,
  },
  {
    key: 'notif_score_reminder',
    label: 'Nhắc nhở nhập điểm',
    description: 'Nhận thông báo khi có sinh viên chờ nhập điểm',
    defaultValue: true,
  },
  {
    key: 'notif_system',
    label: 'Thông báo hệ thống',
    description: 'Nhận các thông báo quan trọng từ Ban quản lý',
    defaultValue: true,
  },
];

export function TeacherSettingsPageClient() {
  const { data: profile, isPending } = useCurrentUser();
  const teacher = profile?.role === 'teacher' ? (profile as TeacherProfile) : null;

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
          title="Hồ sơ giảng viên"
          subtitle="Cập nhật thông tin cá nhân và liên lạc của bạn."
          readonlyFields={[
            {
              label: 'Mã giảng viên',
              value: teacher ? `#${teacher.teacher_id}` : '—',
            },
            {
              label: 'Tên đăng nhập',
              value: teacher?.username || '—',
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
            {
              key: 'phone',
              label: 'Số điện thoại',
              type: 'tel',
              placeholder: 'Nhập số điện thoại',
            },
          ]}
          initialValues={{
            full_name: teacher?.full_name || '',
            email: teacher?.email || '',
            phone: teacher?.phone || '',
          }}
          currentAvatarUrl={teacher?.avatar_url}
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
      content: <NotificationPreferencesForm configs={TEACHER_NOTIF_CONFIGS} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý hồ sơ, mật khẩu và cài đặt thông báo giảng viên.
        </p>
      </div>
      <SettingsLayout sections={sections} />
    </div>
  );
}
