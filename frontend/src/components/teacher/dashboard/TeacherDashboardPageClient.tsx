'use client';

import Link from 'next/link';
import {
  AlertCircle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Lock,
  MapPin,
  RefreshCcw,
  Users,
} from 'lucide-react';
import { useTeacherDashboard } from '@/hooks/queries/useTeacherDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceSummary } from '@/components/dashboard/AttendanceSummary';
import type {
  TeacherDashboardClass,
  TeacherDashboardNotification,
} from '@/types/dashboard';

const STATUS_LABEL: Record<TeacherDashboardClass['effectiveStatus'], string> = {
  ONGOING: 'Đang dạy',
  UPCOMING: 'Sắp dạy',
  FINISHED: 'Kết thúc',
};

const STATUS_CLASS: Record<TeacherDashboardClass['effectiveStatus'], string> = {
  ONGOING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPCOMING: 'bg-blue-100 text-blue-700 border-blue-200',
  FINISHED: 'bg-slate-100 text-slate-600 border-slate-200',
};

function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TeacherDashboardClass['effectiveStatus'];
}) {
  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function ClassTable({
  title,
  sections,
  emptyText,
  showAllHref,
  fillHeight = false,
}: {
  title: string;
  sections: TeacherDashboardClass[];
  emptyText: string;
  showAllHref?: string;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card shadow-xs ${
        fillHeight ? 'flex h-full flex-col' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b border-border p-6 pb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {showAllHref && (
          <Button
            asChild
            variant="ghost"
            className="px-0 text-sm font-semibold text-foreground hover:bg-transparent hover:text-foreground hover:underline"
          >
            <Link href={showAllHref}>Xem tất cả</Link>
          </Button>
        )}
      </div>

      <div className={fillHeight ? 'flex-1' : ''}>
      <Table className={fillHeight ? 'h-full' : undefined}>
        <TableHeader className="bg-transparent">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-10 px-6 text-xs font-semibold uppercase text-muted-foreground">
              Lớp
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold uppercase text-muted-foreground">
              Môn học
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold uppercase text-muted-foreground">
              Lịch dạy
            </TableHead>
            <TableHead className="h-10 px-4 text-xs font-semibold uppercase text-muted-foreground">
              Trạng thái
            </TableHead>
            <TableHead className="h-10 px-6 text-right text-xs font-semibold uppercase text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.section_id} className="border-border">
              <TableCell className="px-6 py-4">
                <div className="font-semibold text-foreground">
                  {section.class_code}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {section._count.enrollments} sinh viên
                </div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="font-semibold text-foreground">
                  {section.subject.subject_name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {section.subject.subject_code}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                <div>{section.day_of_week}</div>
                <div className="mt-1 flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {section.start_time} - {section.end_time}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {section.room}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <StatusBadge status={section.effectiveStatus} />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                {section.effectiveStatus === 'UPCOMING' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled
                    title="Lớp sắp dạy, chưa thể điểm danh."
                  >
                    <Lock className="h-4 w-4" />
                    Chưa mở
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={`/teacher/attendance/${section.section_id}`}>
                      <ClipboardCheck className="h-4 w-4" />
                      Điểm danh
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}

          {sections.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className={`px-6 text-center text-sm text-muted-foreground ${
                  fillHeight ? 'h-full min-h-[320px] align-middle' : 'py-14'
                }`}
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

function NotificationPanel({
  notifications,
}: {
  notifications: TeacherDashboardNotification[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border p-6 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <BellRing className="h-5 w-5" />
          Thông báo mới
        </h2>
        <Button
          asChild
          variant="ghost"
          className="px-0 text-sm font-semibold text-foreground hover:bg-transparent hover:text-foreground hover:underline"
        >
          <Link href="/teacher/notifications">Xem tất cả</Link>
        </Button>
      </div>

      <div className="divide-y divide-border">
        {notifications.map((item) => (
          <div key={item.notification_id} className="px-6 py-4">
            <div className="font-semibold text-foreground">{item.title}</div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.content}
            </p>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            Chưa có thông báo mới.
          </div>
        )}
      </div>
    </div>
  );
}

export function TeacherDashboardPageClient() {
  const { data, isPending, isError, refetch } = useTeacherDashboard();

  if (isPending) return <TeacherDashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-xs">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Không thể tải dashboard giảng viên
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vui lòng thử lại sau ít phút.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng lớp"
          value={data.totalClasses.toLocaleString()}
          icon={CalendarDays}
          iconColor="text-blue-700"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Lớp đang dạy"
          value={data.ongoingClasses.toLocaleString()}
          icon={CheckCircle2}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Tổng sinh viên"
          value={data.totalStudents.toLocaleString()}
          icon={Users}
          iconColor="text-purple-700"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Buổi cần xử lý"
          value={data.incompleteSessions.toLocaleString()}
          icon={AlertCircle}
          iconColor="text-red-700"
          iconBg="bg-red-100"
          trendLabel={`${data.totalSessions.toLocaleString()} buổi học`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassTable
            title="Lịch hôm nay"
            sections={data.todayClasses}
            emptyText="Hôm nay chưa có lớp theo thời khóa biểu."
            showAllHref="/teacher/schedule"
            fillHeight
          />
        </div>
        <AttendanceSummary
          data={{
            present: data.attendanceSummary.present,
            absent: data.attendanceSummary.absent,
            late: data.attendanceSummary.late,
          }}
          isLoading={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClassTable
          title="Lớp gần đây"
          sections={data.recentClasses}
          emptyText="Chưa có lớp học phần nào được phân công."
          showAllHref="/teacher/attendance"
        />
        <NotificationPanel notifications={data.recentNotifications} />
      </div>
    </div>
  );
}
