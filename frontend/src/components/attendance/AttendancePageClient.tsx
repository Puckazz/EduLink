'use client';

import { useCallback, useEffect, useState } from 'react';
import { AttendancePageHeader } from './AttendancePageHeader';
import { AttendanceFilterBar } from './AttendanceFilterBar';
import { AttendanceCourseCard, CourseStatus } from './AttendanceCourseCard';
import { AttendanceEmptyCard } from './AttendanceEmptyCard';
import {
  ClassSectionService,
  ClassSection,
  ClassStatus,
} from '@/services/attendance.service';

const STATUS_MAP: Record<ClassStatus, CourseStatus> = {
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  FINISHED: 'finished',
};

const STATUS_COLOR: Record<ClassStatus, string> = {
  ONGOING: 'bg-red-500',
  UPCOMING: 'bg-indigo-900',
  FINISHED: 'bg-slate-300',
};

function mapSectionToCardProps(s: ClassSection) {
  return {
    id: s.section_id,
    classCode: s.class_code,
    title: s.subject.subject_name,
    subjectCode: s.subject.subject_code,
    teacher: s.teacher_name,
    time: `${s.day_of_week} (${s.start_time} - ${s.end_time})`,
    room: s.room,
    status: STATUS_MAP[s.status],
    topColor: STATUS_COLOR[s.status],
  };
}

export function AttendancePageClient() {
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — default semester matches seeded data
  const [semester, setSemester] = useState<string | undefined>('HK1-2024');
  const [status, setStatus] = useState<ClassStatus | undefined>(undefined);

  const fetchSections = useCallback(
    (sem?: string, sts?: ClassStatus) => {
      setLoading(true);
      setError(null);
      ClassSectionService.getAll(sem, sts)
        .then(setSections)
        .catch(() => setError('Không thể tải danh sách lớp học. Vui lòng thử lại.'))
        .finally(() => setLoading(false));
    },
    [],
  );

  // Initial fetch
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

  return (
    <div className="space-y-6 pb-10">
      <AttendancePageHeader />
      <AttendanceFilterBar onFilterChange={handleFilterChange} />

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Không có lớp học nào phù hợp với bộ lọc đã chọn.
        </div>
      )}

      {!loading && !error && sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {sections.map((section) => (
            <AttendanceCourseCard key={section.section_id} {...mapSectionToCardProps(section)} />
          ))}
          <AttendanceEmptyCard />
        </div>
      )}
    </div>
  );
}

