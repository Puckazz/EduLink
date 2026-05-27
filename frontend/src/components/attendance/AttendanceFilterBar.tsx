'use client';

import { useState } from 'react';
import { BookOpen, Calendar, GraduationCap, LayoutGrid, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';
import type { ClassStatus } from '@/services/attendance.service';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';
import { useMajors } from '@/components/students/hooks/useMajors';

export const STATUS_OPTIONS = [
  { value: 'all',      label: 'Tất cả trạng thái' },
  { value: 'ONGOING',  label: 'Đang diễn ra' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'FINISHED', label: 'Đã kết thúc' },
];

interface AttendanceFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (
    termId: number | undefined,
    status: ClassStatus | undefined,
    academicYearId: number | undefined,
    majorId: number | undefined,
  ) => void;
  defaultTermId?: string;
}

export function AttendanceFilterBar({
  search,
  onSearchChange,
  onFilterChange,
  defaultTermId = 'all',
}: AttendanceFilterBarProps) {
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(defaultTermId);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMajorId, setSelectedMajorId] = useState<string>('all');

  const { years } = useAcademicYears();
  const { terms } = useAcademicTerms({
    academicYearId: selectedYearId === 'all' ? undefined : Number(selectedYearId),
  });
  const { data: majors = [] } = useMajors();

  const isYearSelected = selectedYearId !== 'all';

  const handleChange = (id: string, value: string) => {
    if (id === 'academic_year') {
      setSelectedYearId(value);
      // Reset học kỳ khi đổi năm học
      setSelectedTermId('all');
      const yearId = value === 'all' ? undefined : Number(value);
      const termId = undefined;
      const status = selectedStatus === 'all' ? undefined : (selectedStatus as ClassStatus);
      const majorId = selectedMajorId === 'all' ? undefined : Number(selectedMajorId);
      onFilterChange(termId, status, yearId, majorId);
      return;
    }

    if (id === 'term') {
      setSelectedTermId(value);
      const yearId = selectedYearId === 'all' ? undefined : Number(selectedYearId);
      const termId = value === 'all' ? undefined : Number(value);
      const status = selectedStatus === 'all' ? undefined : (selectedStatus as ClassStatus);
      const majorId = selectedMajorId === 'all' ? undefined : Number(selectedMajorId);
      onFilterChange(termId, status, yearId, majorId);
      return;
    }

    if (id === 'status') {
      setSelectedStatus(value);
      const yearId = selectedYearId === 'all' ? undefined : Number(selectedYearId);
      const termId = selectedTermId === 'all' ? undefined : Number(selectedTermId);
      const status = value === 'all' ? undefined : (value as ClassStatus);
      const majorId = selectedMajorId === 'all' ? undefined : Number(selectedMajorId);
      onFilterChange(termId, status, yearId, majorId);
      return;
    }

    if (id === 'major') {
      setSelectedMajorId(value);
      const yearId = selectedYearId === 'all' ? undefined : Number(selectedYearId);
      const termId = selectedTermId === 'all' ? undefined : Number(selectedTermId);
      const status = selectedStatus === 'all' ? undefined : (selectedStatus as ClassStatus);
      const majorId = value === 'all' ? undefined : Number(value);
      onFilterChange(termId, status, yearId, majorId);
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
    {
      id: 'major',
      label: 'Chuyên ngành',
      icon: <BookOpen />,
      placeholder: 'Tất cả chuyên ngành',
      value: selectedMajorId,
      options: [
        { value: 'all', label: 'Tất cả chuyên ngành' },
        ...majors.map((major) => ({
          value: String(major.major_id),
          label: major.major_name,
        })),
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm mã lớp, môn học, giảng viên, phòng..."
          className="h-10 pl-9"
        />
      </div>
      <FilterBar fields={fields} onFilterChange={handleChange} />
    </div>
  );
}
