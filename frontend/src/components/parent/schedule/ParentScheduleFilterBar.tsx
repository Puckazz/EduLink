'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StudentClassSection } from '@/services/attendance.service';

interface ParentScheduleFilterBarProps {
  sections: StudentClassSection[];
  value: string;
  onChange: (value: string) => void;
}

function formatSemesterLabel(semester: string): string {
  if (semester === 'all') return 'Tất cả học kỳ';
  if (semester.startsWith('HK1')) return `Học kỳ I – ${semester.slice(3)}`;
  if (semester.startsWith('HK2')) return `Học kỳ II – ${semester.slice(3)}`;
  if (semester.startsWith('HKH')) return `Học kỳ Hè – ${semester.slice(3)}`;
  return semester;
}

export function ParentScheduleFilterBar({
  sections,
  value,
  onChange,
}: ParentScheduleFilterBarProps) {
  const semesterOptions = useMemo(() => {
    const unique = [...new Set(sections.map((s) => s.semester))].sort(
      (a, b) => b.localeCompare(a),
    );
    return [
      { value: 'all', label: 'Tất cả học kỳ' },
      ...unique.map((s) => ({ value: s, label: formatSemesterLabel(s) })),
    ];
  }, [sections]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Học kỳ:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[200px] text-sm">
          <SelectValue placeholder="Tất cả học kỳ" />
        </SelectTrigger>
        <SelectContent>
          {semesterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
