'use client';

import { useState } from 'react';
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
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(defaultTermId);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { years } = useAcademicYears();
  const { terms } = useAcademicTerms({
    academicYearId: selectedYearId === 'all' ? undefined : Number(selectedYearId),
  });

  const isYearSelected = selectedYearId !== 'all';

  const handleChange = (id: string, value: string) => {
    if (id === 'academic_year') {
      setSelectedYearId(value);
      // Reset học kỳ khi đổi năm học
      setSelectedTermId('all');
      const yearId = value === 'all' ? undefined : Number(value);
      const termId = undefined;
      const status = selectedStatus === 'all' ? undefined : (selectedStatus as ClassStatus);
      onFilterChange(termId, status, yearId);
      return;
    }

    if (id === 'term') {
      setSelectedTermId(value);
      const yearId = selectedYearId === 'all' ? undefined : Number(selectedYearId);
      const termId = value === 'all' ? undefined : Number(value);
      const status = selectedStatus === 'all' ? undefined : (selectedStatus as ClassStatus);
      onFilterChange(termId, status, yearId);
      return;
    }

    if (id === 'status') {
      setSelectedStatus(value);
      const yearId = selectedYearId === 'all' ? undefined : Number(selectedYearId);
      const termId = selectedTermId === 'all' ? undefined : Number(selectedTermId);
      const status = value === 'all' ? undefined : (value as ClassStatus);
      onFilterChange(termId, status, yearId);
    }
  };

  const fields: FilterField[] = [
    {
      id: 'academic_year',
      label: 'Năm học',
      icon: <GraduationCap />,
      placeholder: 'Tất cả năm học',
      value: selectedYearId,
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
      placeholder: isYearSelected ? 'Tất cả học kỳ' : 'Chọn năm học trước',
      value: selectedTermId,
      disabled: !isYearSelected,
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
      value: selectedStatus,
      options: STATUS_OPTIONS,
    },
  ];

  return <FilterBar fields={fields} onFilterChange={handleChange} />;
}
