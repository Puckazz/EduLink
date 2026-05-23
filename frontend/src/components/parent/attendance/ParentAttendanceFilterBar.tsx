'use client';

import { Calendar, GraduationCap } from 'lucide-react';
import { FilterBar, type FilterField } from '@/components/shared/FilterBar';
import { useAcademicYears } from '@/hooks/queries/useAcademicYears';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';

interface ParentAttendanceFilterBarProps {
  academicYearValue: string;
  termValue: string;
  onAcademicYearChange: (academicYearId: string) => void;
  onTermChange: (termId: string) => void;
}

export function ParentAttendanceFilterBar({
  academicYearValue,
  termValue,
  onAcademicYearChange,
  onTermChange,
}: ParentAttendanceFilterBarProps) {
  const { years } = useAcademicYears();
  const { terms } = useAcademicTerms({
    academicYearId:
      academicYearValue === 'all' ? undefined : Number(academicYearValue),
  });

  const handleChange = (id: string, value: string) => {
    if (id === 'academic_year') {
      onAcademicYearChange(value);
    }
    if (id === 'term') {
      onTermChange(value);
    }
  };

  const fields: FilterField[] = [
    {
      id: 'academic_year',
      label: 'Năm học',
      icon: <GraduationCap />,
      placeholder: 'Tất cả năm học',
      defaultValue: academicYearValue,
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
      placeholder: 'Tất cả học kỳ',
      defaultValue: termValue,
      options: [
        { value: 'all', label: 'Tất cả học kỳ' },
        ...terms.map((term) => ({
          value: String(term.term_id),
          label: term.name,
        })),
      ],
    },
  ];

  return <FilterBar fields={fields} onFilterChange={handleChange} />;
}
