'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Clock, MapPin, Users, CalendarDays, ArrowRight, History, GraduationCap, BookMarked } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AttendanceFilterBar } from './AttendanceFilterBar';
import {
  ClassSectionService,
  ClassSection,
  ClassStatus,
} from '@/services/attendance.service';

// ── Status config ──────────────────────────────────────────────────────────────

type CourseStatus = 'ongoing' | 'upcoming' | 'finished';

const STATUS_MAP: Record<ClassStatus, CourseStatus> = {
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  FINISHED: 'finished',
};

const STATUS_CONFIG: Record<
  CourseStatus,
  { label: string; color: string; dot: string; accent: string }
> = {
  ongoing: {
    label: 'Đang diễn ra',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    accent: 'from-emerald-500 to-teal-600',
  },
  upcoming: {
    label: 'Sắp diễn ra',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    dot: 'bg-indigo-500',
    accent: 'from-indigo-500 to-blue-600',
  },
  finished: {
    label: 'Đã kết thúc',
    color: 'text-slate-500 bg-slate-50 border-slate-200',
    dot: 'bg-slate-400',
    accent: 'from-slate-400 to-slate-500',
  },
};

// ── Teacher Course Card ────────────────────────────────────────────────────────

interface TeacherCourseCardProps {
  id: number;
  classCode: string;
  title: string;
  subjectCode: string;
  time: string;
  room: string;
  status: CourseStatus;
  enrollmentCount: number;
  sessionCount: number;
}

function TeacherCourseCard({
  id,
  classCode,
  title,
  subjectCode,
  time,
  room,
  status,
  enrollmentCount,
  sessionCount,
}: TeacherCourseCardProps) {
  const cfg = STATUS_CONFIG[status];
  const isFinished = status === 'finished';

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
      {/* Gradient accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.accent}`} />

      {/* Card content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header row: class code + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Mã lớp
            </span>
            <span className="text-sm font-mono font-bold text-slate-700">
              {classCode}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${cfg.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </Badge>
        </div>

        {/* Subject info */}
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center shrink-0 shadow-sm`}>
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {subjectCode}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Details */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{time}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Phòng <span className="font-semibold text-slate-700">{room}</span></span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-0.5">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">{enrollmentCount}</span>
            <span className="text-slate-400 text-xs">sinh viên</span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">{sessionCount}</span>
            <span className="text-slate-400 text-xs">buổi học</span>
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-auto pt-1">
          <Link href={`/teacher/attendance/${id}`} className="block w-full">
            <button
              className={`w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm h-10 px-5 transition-all duration-200
                ${isFinished
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-700 text-white shadow-sm hover:shadow-md'
                }`}
            >
              {isFinished ? (
                <>
                  <History className="h-4 w-4" />
                  Xem lịch sử điểm danh
                </>
              ) : (
                <>
                  Điểm danh ngay
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse h-[340px]">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          <div className="h-6 w-28 bg-slate-100 rounded-full" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
        <div className="h-px bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BookMarked className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">
        Không tìm thấy lớp học nào
      </h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        Không có lớp học phù hợp với bộ lọc đã chọn. Thử thay đổi học kỳ hoặc trạng thái.
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function TeacherAttendancePageClient() {
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [semester, setSemester] = useState<string | undefined>('HK1-2024');
  const [status, setStatus] = useState<ClassStatus | undefined>(undefined);

  const fetchSections = useCallback((sem?: string, sts?: ClassStatus) => {
    setLoading(true);
    setError(null);
    ClassSectionService.getAll(sem, sts)
      .then(setSections)
      .catch(() => setError('Không thể tải danh sách lớp học. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSections(semester, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback(
    (newSemester: string | undefined, newStatus: ClassStatus | undefined) => {
      setSemester(newSemester);
      setStatus(newStatus);
      fetchSections(newSemester, newStatus);
    },
    [fetchSections],
  );

  // Summary counts
  const ongoingCount = sections.filter((s) => s.status === 'ONGOING').length;
  const totalStudents = sections.reduce((sum, s) => sum + (s._count?.enrollments ?? 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Lớp dạy của tôi
            </h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Chọn một lớp học để bắt đầu điểm danh sinh viên và theo dõi tiến độ.
          </p>
        </div>

        {/* Quick stats */}
        {!loading && !error && sections.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-slate-700">{ongoingCount} lớp đang dạy</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">{totalStudents} sinh viên</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <AttendanceFilterBar onFilterChange={handleFilterChange} />

      {/* ── Content ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
        {loading && [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)}

        {!loading && !error && sections.length === 0 && <EmptyState />}

        {!loading &&
          !error &&
          sections.map((section) => (
            <TeacherCourseCard
              key={section.section_id}
              id={section.section_id}
              classCode={section.class_code}
              title={section.subject.subject_name}
              subjectCode={section.subject.subject_code}
              time={`${section.day_of_week} (${section.start_time} – ${section.end_time})`}
              room={section.room}
              status={STATUS_MAP[section.status]}
              enrollmentCount={section._count?.enrollments ?? 0}
              sessionCount={section._count?.sessions ?? 0}
            />
          ))}
      </div>
    </div>
  );
}
