'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentStore } from '@/stores/useStudentStore';
import type { ParentProfile } from '@/types/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const segmentLabelMap: Record<string, string> = {
  admin: 'Tổng quan',
  teacher: 'Tổng quan',
  parent: 'Tổng quan',
  students: 'Sinh viên',
  parents: 'Quản lý phụ huynh',
  'parent-links': 'Liên kết PH - SV',
  teachers: 'Giảng viên',
  schedule: 'Thời khóa biểu',
  feedbacks: 'Hộp Thư Phản Hồi',
  reports: 'Báo cáo',
  notifications: 'Thông báo',
  scores: 'Quản lý điểm',
  attendance: 'Điểm danh',
  settings: 'Cài đặt',
  dashboard: 'Bảng điều khiển',
  feedback: 'Phản hồi',
};

const pagesWithGlobalSearch = ['/admin'];

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let cumulativePath = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    cumulativePath += `/${part}`;

    const isNumeric = /^\d+$/.test(part);

    if (isNumeric) {
      const parent = parts[i - 1];
      if (parent === 'attendance') {
        crumbs.push({ label: 'Chi tiết buổi học', href: cumulativePath });
      } else if (parent === 'students') {
        crumbs.push({ label: 'Chi tiết sinh viên', href: cumulativePath });
      } else {
        crumbs.push({ label: 'Chi tiết', href: cumulativePath });
      }
    } else {
      const label = segmentLabelMap[part];
      if (label) {
        crumbs.push({ label, href: cumulativePath });
      }
    }
  }

  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const { data: profile, isLoading } = useCurrentUser();

  const showGlobalSearch = pagesWithGlobalSearch.includes(pathname);
  const crumbs = buildBreadcrumbs(pathname);

  const { selectedStudentId, setSelectedStudentId } = useStudentStore();

  const isParent = profile?.role === 'parent';
  const parentProfile = profile as ParentProfile | undefined;
  const students = useMemo(
    () => parentProfile?.students ?? [],
    [parentProfile?.students],
  );

  useEffect(() => {
    if (isParent && students.length > 0 && selectedStudentId === null) {
      setSelectedStudentId(students[0].student_id);
    }
  }, [isParent, students, selectedStudentId, setSelectedStudentId]);

  const displayName =
    profile?.role === 'admin'
      ? profile.full_name || profile.username
      : profile?.role === 'parent' || profile?.role === 'teacher'
        ? profile.full_name
        : 'Đang tải...';
        
  const roleLabel =
    profile?.role === 'admin'
      ? 'Quản trị viên'
      : profile?.role === 'teacher'
        ? 'Giảng viên'
        : profile?.role === 'parent'
          ? 'Phụ huynh'
          : '...';
          


  const avatarText =
    profile?.role === 'admin' || profile?.role === 'teacher'
      ? (profile.full_name || profile.username || 'A').slice(0, 1).toUpperCase()
      : profile?.role === 'parent'
        ? (profile.full_name || 'P').slice(0, 1).toUpperCase()
        : '...';

  return (
    <header className="flex h-18 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        <SidebarTrigger className="-ml-2" />
        {showGlobalSearch ? (
          <>
            <h1 className="min-w-30 text-xl font-bold text-foreground">
              {crumbs[0]?.label ?? 'Tổng quan'}
            </h1>

            <div className="hidden h-6 w-px bg-border sm:block" />

            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã sinh viên, phụ huynh..."
                className="w-full border-none bg-muted/40 pl-9 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          </>
        ) : (
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                  <BreadcrumbItem key={crumb.href}>
                    {!isLast ? (
                      <>
                        <BreadcrumbLink href={crumb.href} className="text-sm">
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    ) : (
                      <BreadcrumbPage className="text-sm font-semibold">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-4 sm:gap-6">
        {isParent && students.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedStudentId?.toString() ?? ''}
              onValueChange={(val) => setSelectedStudentId(Number(val))}
            >
              <SelectTrigger className="w-[180px] h-9 text-xs font-semibold bg-slate-50 border-slate-200">
                <SelectValue placeholder="Chọn học sinh" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem
                    key={student.student_id}
                    value={student.student_id.toString()}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {student.full_name} - {student.student_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <NotificationBell />

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-sm font-bold leading-tight text-foreground">
              {isLoading ? 'Đang tải...' : displayName}
            </span>
            <span className="text-xs font-medium leading-tight text-muted-foreground">
              {roleLabel}
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
