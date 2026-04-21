'use client';

import { useRef } from 'react';
import { Calendar, LayoutGrid } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';
import type { ClassStatus } from '@/services/attendance.service';

// Học kỳ khớp với format trong seed: "HK1-2024", "HK2-2024"
export const SEMESTER_OPTIONS = [
  { value: 'all', label: 'Tất cả học kỳ' },
  { value: 'HK1-2024', label: 'HK 1 - 2024' },
  { value: 'HK2-2024', label: 'HK 2 - 2024' },
  { value: 'HK1-2025', label: 'HK 1 - 2025' },
  { value: 'HK2-2025', label: 'HK 2 - 2025' },
];

export const STATUS_OPTIONS = [
  { value: 'all',      label: 'Tất cả trạng thái' },
  { value: 'ONGOING',  label: 'Đang diễn ra' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'FINISHED', label: 'Đã kết thúc' },
];

interface AttendanceFilterBarProps {
  /** Gọi lại mỗi khi filter thay đổi với giá trị đã chọn */
  onFilterChange: (semester: string | undefined, status: ClassStatus | undefined) => void;
}

export function AttendanceFilterBar({ onFilterChange }: AttendanceFilterBarProps) {
  // Giữ giá trị hiện tại của từng filter mà không gây re-render
  const semesterRef = useRef<string | undefined>('HK1-2024');
  const statusRef = useRef<ClassStatus | undefined>(undefined);

  const handleChange = (id: string, value: string) => {
    if (id === 'semester') {
      semesterRef.current = value === 'all' ? undefined : value;
    }
    if (id === 'status') {
      statusRef.current = value === 'all' ? undefined : (value as ClassStatus);
    }
    onFilterChange(semesterRef.current, statusRef.current);
  };

  const fields: FilterField[] = [
    {
      id: 'semester',
      label: 'Học kỳ',
      icon: <Calendar />,
      placeholder: 'Chọn học kỳ',
      defaultValue: 'HK1-2024',
      options: SEMESTER_OPTIONS,
    },
    {
      id: 'status',
      label: 'Trạng thái lớp',
      icon: <LayoutGrid />,
      placeholder: 'Tất cả trạng thái',
      defaultValue: 'all',
      options: STATUS_OPTIONS,
    },
  ];

  return <FilterBar fields={fields} onFilterChange={handleChange} />;
}
