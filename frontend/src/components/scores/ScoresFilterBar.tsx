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
      <CardContent className="grid gap-4 px-6 pt-6 pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Library className="h-4 w-4 text-muted-foreground" />
            Chuyên ngành <span className="text-destructive">*</span>
          </p>
          <Select value={selectedMajor} onValueChange={onMajorChange}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-muted-foreground" />
            Lớp
          </p>
          <Select
            value={selectedClass}
            onValueChange={onClassChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn lớp" />
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

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Môn học
          </p>
          <Select
            value={selectedSubjectId}
            onValueChange={onSubjectChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn</SelectItem>
              {subjects.map((subject) => (
                <SelectItem
                  key={subject.subject_id}
                  value={String(subject.subject_id)}
                >
                  {subject.subject_code} - {subject.subject_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Năm học
          </p>
          <Select
            value={selectedAcademicYearId}
            onValueChange={onAcademicYearChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {years.map((year) => (
                <SelectItem
                  key={year.academic_year_id}
                  value={String(year.academic_year_id)}
                >
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Học kỳ
          </p>
          <Select
            value={selectedTermId}
            onValueChange={onTermChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn học kỳ" />
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

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Trạng thái
          </p>
          <Select
            value={selectedStatus}
            onValueChange={onStatusChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PUBLISHED">Đã công bố</SelectItem>
              <SelectItem value="DRAFT">Nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Tìm học sinh</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Nhập tên hoặc mã học sinh"
              className="pl-9"
              disabled={!isMajorSelected}
            />
          </div>
        </div>

        <div className="col-span-full flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4 mt-2">
          <p className="mr-auto text-xs text-muted-foreground">
            Chọn chuyên ngành để tự động tải dữ liệu.
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
          <Button onClick={onApplyFilters} disabled={!canAutoLoad}>
            Áp dụng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
