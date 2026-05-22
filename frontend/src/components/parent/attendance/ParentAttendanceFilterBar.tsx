'use client';

import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';

export const ATTENDANCE_SEMESTER_OPTIONS = [
  { value: 'all',       label: 'Tất cả học kỳ' },
  { value: 'HK1/2025',  label: 'HK 1 – 2025' },
  { value: 'HK2/2024',  label: 'HK 2 – 2024' },
  { value: 'HK1/2024',  label: 'HK 1 – 2024' },
  { value: 'HK2/2023',  label: 'HK 2 – 2023' },
  { value: 'HK1/2023',  label: 'HK 1 – 2023' },
];

export function formatSemesterLabel(raw: string): string {
  const found = ATTENDANCE_SEMESTER_OPTIONS.find((o) => o.value === raw);
  if (found) return found.label;

  const slashMatch = raw.match(/^(HK)(\d)\/(\d{4})$/);
  if (slashMatch) return `HK ${slashMatch[2]} – ${slashMatch[3]}`;

  const dashMatch = raw.match(/^(HK)(\d)-(\d{4})$/);
  if (dashMatch) return `HK ${dashMatch[2]} – ${dashMatch[3]}`;

  return raw;
}

interface ParentAttendanceFilterBarProps {
  onFilterChange: (semester: string) => void;
}

export function ParentAttendanceFilterBar({ onFilterChange }: ParentAttendanceFilterBarProps) {
  const semesterRef = useRef<string>('all');

  const handleChange = (id: string, value: string) => {
    if (id === 'semester') {
      semesterRef.current = value;
      onFilterChange(value);
    }
  };

  const fields: FilterField[] = [
    {
      id: 'semester',
      label: 'Học kỳ',
      icon: <Calendar />,
      placeholder: 'Tất cả học kỳ',
      defaultValue: 'all',
      options: ATTENDANCE_SEMESTER_OPTIONS,
    },
  ];

  return <FilterBar fields={fields} onFilterChange={handleChange} />;
}
