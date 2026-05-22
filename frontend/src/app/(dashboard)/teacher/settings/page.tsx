import { TeacherSettingsPageClient } from '@/components/teacher/settings/TeacherSettingsPageClient';

export const metadata = {
  title: 'Cài đặt giảng viên | EduLink',
  description: 'Quản lý hồ sơ và mật khẩu giảng viên',
};

export default function TeacherSettingsPage() {
  return <TeacherSettingsPageClient />;
}
