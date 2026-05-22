import { AdminSettingsPageClient } from '@/components/admin/settings/AdminSettingsPageClient';

export const metadata = {
  title: 'Cài đặt | EduLink',
  description: 'Quản lý hồ sơ và mật khẩu quản trị viên',
};

export default function AdminSettingsPage() {
  return <AdminSettingsPageClient />;
}
