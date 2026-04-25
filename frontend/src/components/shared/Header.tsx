'use client';

import { usePathname } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const titleMap: Record<string, string> = {
  '/admin': 'Tổng quan',
  '/admin/students': 'Sinh viên',
  '/admin/parents': 'Quản lý phụ huynh',
  '/admin/parent-links': 'Thiết lập & Quản lý Liên kết PH - SV',
  '/admin/teachers': 'Giảng viên',
  '/admin/schedule': 'Thời khóa biểu',
  '/admin/feedbacks': 'Hộp Thư Phản Hồi Phụ Huynh',
  '/admin/reports': 'Báo cáo',
  '/admin/notifications': 'Thông báo',
  '/admin/scores': 'Quản lý điểm',
  '/admin/attendance': 'Điểm danh',
  '/admin/settings': 'Cài đặt',
  '/parent/dashboard': 'Bảng điều khiển',
  '/parent/scores': 'Điểm số của con',
  '/parent/attendance': 'Chuyên cần',
  '/parent/feedback': 'Phản hồi',
  '/parent/finance': 'Tài chính',
  '/parent/settings': 'Cài đặt',
};

// Pages that should show the global search bar in the header
const pagesWithGlobalSearch = ['/admin'];

export function Header() {
  const pathname = usePathname();
  const { data: profile, isLoading } = useCurrentUser();
  const currentLabel = titleMap[pathname] || 'Tổng quan';
  const showGlobalSearch = pagesWithGlobalSearch.includes(pathname);
  const displayName =
    profile?.role === 'admin'
      ? profile.full_name || profile.username
      : profile?.role === 'parent'
        ? profile.full_name
        : 'Đang tải...';
  const roleLabel =
    profile?.role === 'admin'
      ? 'Quản trị viên'
      : profile?.role === 'parent'
        ? 'Phụ huynh'
        : '...';
  const contactLabel =
    profile?.role === 'admin'
      ? profile.email || profile.username
      : profile?.role === 'parent'
        ? profile.phone
        : 'Đang tải thông tin';
  const avatarText =
    profile?.role === 'admin'
      ? (profile.full_name || profile.username || 'A').slice(0, 1)
      : profile?.role === 'parent'
        ? profile.full_name.slice(0, 1)
        : '...';

  return (
    <header className="flex h-18 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
      {/* Left section: Title & Search / Breadcrumb */}
      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        <SidebarTrigger className="-ml-2" />
        {showGlobalSearch ? (
          <>
            <h1 className="min-w-30 text-xl font-bold text-foreground">
              {currentLabel}
            </h1>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-border sm:block" />

            {/* Global Search */}
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã sinh viên, phụ huynh..."
                className="w-full border-none bg-muted/40 pl-9 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          </>
        ) : (
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
              Trang chủ
            </span>
            {currentLabel && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {currentLabel}
                </span>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Right section: Actions & Profile */}
      <div className="ml-4 flex shrink-0 items-center gap-6">
        {/* Notification bell */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-sm font-bold leading-tight text-foreground">
              {isLoading ? 'Đang tải...' : displayName}
            </span>
            <span className="text-xs font-medium leading-tight text-muted-foreground">
              {roleLabel}
            </span>
            <span className="text-[11px] font-medium leading-tight text-muted-foreground">
              {contactLabel}
            </span>
          </div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
            <div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-amber-200 to-orange-400 text-sm font-bold text-orange-900">
              {isLoading ? '...' : avatarText}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
