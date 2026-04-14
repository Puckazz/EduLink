'use client';

import { AttendancePageHeader } from './AttendancePageHeader';
import { AttendanceFilterBar } from './AttendanceFilterBar';
import { AttendanceCourseCard, CourseStatus } from './AttendanceCourseCard';
import { AttendanceEmptyCard } from './AttendanceEmptyCard';

// Dummy data inside the client component matching the UI image
const MOCK_COURSES = [
  {
    id: 1,
    classCode: 'L01',
    title: 'Giải tích 1',
    subjectCode: 'MATH101',
    teacher: 'PGS.TS. Nguyễn Văn A',
    time: 'Thứ 2 (7:30 - 9:30)',
    room: 'A1.202',
    status: 'ongoing' as CourseStatus,
    topColor: 'bg-red-500',
  },
  {
    id: 2,
    classCode: 'L02',
    title: 'Lập trình C++',
    subjectCode: 'CS202',
    teacher: 'ThS. Trần Thị B',
    time: 'Thứ 4 (13:30 - 15:30)',
    room: 'C2.501 (Lab)',
    status: 'upcoming' as CourseStatus,
    topColor: 'bg-indigo-900',
  },
  {
    id: 3,
    classCode: 'L05',
    title: 'Vật lý đại cương',
    subjectCode: 'PHYS101',
    teacher: 'TS. Phạm Văn C',
    time: 'Thứ 6 (9:45 - 11:45)',
    room: 'B3.104',
    status: 'ongoing' as CourseStatus,
    topColor: 'bg-red-500',
  },
  {
    id: 4,
    classCode: 'L01',
    title: 'Cấu trúc dữ liệu',
    subjectCode: 'CS301',
    teacher: 'GS. Lê Hoàng D',
    time: 'Thứ 3 (7:30 - 9:30)',
    room: 'C2.302',
    status: 'finished' as CourseStatus,
    topColor: 'bg-slate-300',
  },
];

export function AttendancePageClient() {
  return (
    <div className="space-y-6 pb-10">
      <AttendancePageHeader />
      <AttendanceFilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {MOCK_COURSES.map((course) => (
          <AttendanceCourseCard key={course.id} {...course} />
        ))}
        <AttendanceEmptyCard />
      </div>
    </div>
  );
}
