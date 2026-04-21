'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AttendanceDetailHeader } from './AttendanceDetailHeader';
import { AttendanceStatsCards } from './AttendanceStatsCards';
import { AttendanceDetailFilters } from './AttendanceDetailFilters';
import {
  AttendanceDetailTableCard,
  type StudentAttendance,
  type AttendanceStatus,
} from './AttendanceDetailTableCard';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { exportAttendanceWithSummary } from '@/components/attendance/utils/attendance-excel';

const INITIAL_STUDENTS: StudentAttendance[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    mssv: '2023001',
    avatar: 'https://i.pravatar.cc/150?u=1',
    status: 'present',
    note: '',
    hasMessage: false,
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    mssv: '2023002',
    avatar: 'https://i.pravatar.cc/150?u=2',
    status: 'late',
    note: 'Đến muộn 15 phút',
    hasMessage: false,
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    mssv: '2023003',
    avatar: 'https://i.pravatar.cc/150?u=3',
    status: 'absent',
    note: 'Nghỉ Ốm',
    hasMessage: true,
  },
  {
    id: '4',
    name: 'Phạm Minh Đức',
    mssv: '2023004',
    avatar: 'https://i.pravatar.cc/150?u=4',
    status: 'present',
    note: '',
    hasMessage: false,
  },
  {
    id: '5',
    name: 'Hoàng Thị Dung',
    mssv: '2023005',
    avatar: 'https://i.pravatar.cc/150?u=5',
    status: 'present',
    note: '',
    hasMessage: false,
  },
  {
    id: '6',
    name: 'Vũ Quốc Hưng',
    mssv: '2023006',
    avatar: 'https://i.pravatar.cc/150?u=6',
    status: 'late',
    note: 'Xe hỏng',
    hasMessage: false,
  },
  {
    id: '7',
    name: 'Đinh Ngọc Ánh',
    mssv: '2023007',
    avatar: 'https://i.pravatar.cc/150?u=7',
    status: 'present',
    note: '',
    hasMessage: false,
  },
];

export function AttendanceDetailPageClient({ courseId }: { courseId: string }) {
  const sessionLabel = `Buổi học – Lớp ${courseId}`;

  const [students, setStudents] =
    useState<StudentAttendance[]>(INITIAL_STUDENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, note } : s)));
  };

  const handleExportReport = () => {
    try {
      exportAttendanceWithSummary(students, sessionLabel);
    } catch {
      toast.error('Không thể xuất báo cáo điểm danh.');
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);

    // TODO: thay bằng API call thực khi backend hỗ trợ
    // Hiện tại chỉ toast khi người dùng bấm nút, không auto-fire
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Đã lưu điểm danh thành công.');
    }, 600);
  };


  return (
    <div className="space-y-6 pb-12 w-full">
      <AttendanceDetailHeader
        sessionLabel={sessionLabel}
        onExportReport={handleExportReport}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <AttendanceStatsCards />
      <AttendanceDetailFilters />
      <AttendanceDetailTableCard
        students={students}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
        footer={
          <PaginationBar
            currentPage={currentPage}
            totalPages={5}
            totalItems={45}
            pageSize={10}
            isBusy={false}
            onPageChange={setCurrentPage}
          />
        }
      />
    </div>
  );
}
