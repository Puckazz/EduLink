'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Năm học:</span>
      <Select value={academicYearValue} onValueChange={onAcademicYearChange}>
        <SelectTrigger className="h-9 w-[200px] text-sm">
          <SelectValue placeholder="Tất cả năm học" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả năm học</SelectItem>
          {years.map((year) => (
            <SelectItem key={year.academic_year_id} value={String(year.academic_year_id)}>
              {year.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm font-medium text-muted-foreground">Học kỳ:</span>
      <Select value={termValue} onValueChange={onTermChange}>
        <SelectTrigger className="h-9 w-[200px] text-sm">
          <SelectValue placeholder="Tất cả học kỳ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả học kỳ</SelectItem>
          {terms.map((term) => (
            <SelectItem key={term.term_id} value={String(term.term_id)}>
              {term.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
