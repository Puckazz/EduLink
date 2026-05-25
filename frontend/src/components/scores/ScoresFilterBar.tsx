import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Search, Users, Library, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Subject } from '@/types/subject';
import type { AcademicTerm, AcademicYear } from '@/types/academic-term';

interface ScoresFilterBarProps {
  searchKeyword: string;
  selectedMajor: string;
  selectedClass: string;
  selectedSubjectId: string;
  selectedAcademicYearId: string;
  selectedTermId: string;
  selectedStatus: 'all' | 'PUBLISHED' | 'DRAFT';
  majorOptions: string[];
  classOptions: string[];
  subjects: Subject[];
  years: AcademicYear[];
  terms: AcademicTerm[];
  isMajorSelected: boolean;
  canAutoLoad: boolean;
  onSearchKeywordChange: (value: string) => void;
  onMajorChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onTermChange: (value: string) => void;
  onStatusChange: (value: 'all' | 'PUBLISHED' | 'DRAFT') => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function ScoresFilterBar({
  searchKeyword,
  selectedMajor,
  selectedClass,
  selectedSubjectId,
  selectedAcademicYearId,
  selectedTermId,
  selectedStatus,
  majorOptions,
  classOptions,
  subjects,
  years,
  terms,
  isMajorSelected,
  canAutoLoad,
  onSearchKeywordChange,
  onMajorChange,
  onClassChange,
  onSubjectChange,
  onAcademicYearChange,
  onTermChange,
  onStatusChange,
  onApplyFilters,
  onClearFilters,
}: ScoresFilterBarProps) {
  const [inputValue, setInputValue] = useState(searchKeyword);

  useEffect(() => {
    setInputValue(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchKeyword) {
        onSearchKeywordChange(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchKeywordChange, searchKeyword]);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardContent className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
        {/* Filter fields — flex-wrap so each item has a minimum width and wraps gracefully */}
        <div className="flex flex-wrap gap-3">
          {/* Chuyên ngành */}
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Library className="h-3.5 w-3.5" />
              Chuyên ngành <span className="text-destructive">*</span>
            </p>
            <Select value={selectedMajor} onValueChange={onMajorChange}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Chọn chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                {majorOptions.map((majorName) => (
                  <SelectItem key={majorName} value={majorName}>
                    {majorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lớp */}
          <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Lớp
            </p>
            <Select value={selectedClass} onValueChange={onClassChange} disabled={!isMajorSelected}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Tất cả lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {classOptions.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Môn học */}
          <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Môn học
            </p>
            <Select value={selectedSubjectId} onValueChange={onSubjectChange} disabled={!isMajorSelected}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Tất cả môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.subject_id} value={String(subject.subject_id)}>
                    {subject.subject_code} - {subject.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Năm học */}
          <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Năm học
            </p>
            <Select value={selectedAcademicYearId} onValueChange={onAcademicYearChange} disabled={!isMajorSelected}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Tất cả năm" />
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
          </div>

          {/* Học kỳ */}
          <div className="flex min-w-[140px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Học kỳ
            </p>
            <Select value={selectedTermId} onValueChange={onTermChange} disabled={!isMajorSelected || selectedAcademicYearId === 'all'}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder={selectedAcademicYearId === 'all' ? 'Chọn năm học trước' : 'Tất cả học kỳ'} />
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

          {/* Trạng thái */}
          <div className="flex min-w-[140px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Trạng thái
            </p>
            <Select value={selectedStatus} onValueChange={onStatusChange} disabled={!isMajorSelected}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PUBLISHED">Đã công bố</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tìm học sinh */}
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Tìm học sinh
            </p>
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Tên hoặc mã học sinh"
                className="w-full"
                disabled={!isMajorSelected}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Chọn chuyên ngành để tự động tải dữ liệu.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Xóa bộ lọc
            </Button>
            <Button size="sm" onClick={onApplyFilters} disabled={!canAutoLoad}>
              Áp dụng
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

