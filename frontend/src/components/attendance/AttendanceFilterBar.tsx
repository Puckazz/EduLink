'use client';

import { useRef } from 'react';
import { Calendar, GraduationCap, LayoutGrid } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';
import type { ClassStatus } from '@/services/attendance.service';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';

export const STATUS_OPTIONS = [
  { value: 'all',      label: 'Tất cả trạng thái' },
  { value: 'ONGOING',  label: 'Đang diễn ra' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'FINISHED', label: 'Đã kết thúc' },
];

interface AttendanceFilterBarProps {
  onFilterChange: (
    termId: number | undefined,
    status: ClassStatus | undefined,
    academicYearId: number | undefined,
  ) => void;
  defaultTermId?: string;
}

export function AttendanceFilterBar({
  onFilterChange,
  defaultTermId = 'all',
}: AttendanceFilterBarProps) {
  const { years } = useAcademicYears();
  const yearRef = useRef<number | undefined>(undefined);
  const { terms } = useAcademicTerms({
    academicYearId: yearRef.current,
  });
  const termRef = useRef<number | undefined>(
    defaultTermId === 'all' ? undefined : Number(defaultTermId),
  );
  const statusRef = useRef<ClassStatus | undefined>(undefined);

  const handleChange = (id: string, value: string) => {
    if (id === 'academic_year') {
      yearRef.current = value === 'all' ? undefined : Number(value);
      termRef.current = undefined;
    }
    if (id === 'term') {
      termRef.current = value === 'all' ? undefined : Number(value);
    }
    if (id === 'status') {
      statusRef.current = value === 'all' ? undefined : (value as ClassStatus);
    }
    onFilterChange(termRef.current, statusRef.current, yearRef.current);
  };

  const fields: FilterField[] = [
    {
      id: 'academic_year',
      label: 'Năm học',
      icon: <GraduationCap />,
      placeholder: 'Tất cả năm học',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Tất cả năm học' },
        ...years.map((year) => ({
          value: String(year.academic_year_id),
          label: year.name,
        })),
      ],
    },
    {
      id: 'term',
      label: 'Học kỳ',
      icon: <Calendar />,
      placeholder: 'Chọn học kỳ',
      defaultValue: defaultTermId,
      options: [
        { value: 'all', label: 'Tất cả học kỳ' },
        ...terms.map((term) => ({
          value: String(term.term_id),
          label: term.name,
        })),
      ],
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
