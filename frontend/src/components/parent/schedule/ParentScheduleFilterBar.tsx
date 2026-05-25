'use client';

import { Calendar, GraduationCap } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';

interface ParentScheduleFilterBarProps {
  academicYearValue: string;
  termValue: string;
  onAcademicYearChange: (value: string) => void;
  onTermChange: (value: string) => void;
}

export function ParentScheduleFilterBar({
  academicYearValue,
  termValue,
  onAcademicYearChange,
  onTermChange,
}: ParentScheduleFilterBarProps) {
  const { years } = useAcademicYears();
  const { terms } = useAcademicTerms({
    academicYearId:
      academicYearValue === 'all' ? undefined : Number(academicYearValue),
  });

  const isYearSelected = academicYearValue !== 'all';

  const fields: FilterField[] = [
    {
      id: 'academic_year',
      label: 'Năm học',
      icon: <GraduationCap />,
      placeholder: 'Tất cả năm học',
      value: academicYearValue,
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
      value: termValue,
      disabled: !isYearSelected,
      options: [
        { value: 'all', label: 'Tất cả học kỳ' },
        ...terms.map((term) => ({
          value: String(term.term_id),
          label: term.name,
        })),
      ],
    },
  ];

  const handleChange = (id: string, value: string) => {
    if (id === 'academic_year') onAcademicYearChange(value);
    if (id === 'term') onTermChange(value);
  };

  return <FilterBar fields={fields} onFilterChange={handleChange} />;
}
