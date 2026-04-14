import { BookOpen, Calendar, Search, Users, Library } from 'lucide-react';
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

interface ScoresFilterBarProps {
  searchKeyword: string;
  selectedMajor: string;
  selectedClass: string;
  selectedSubjectId: string;
  selectedSemester: string;
  majorOptions: string[];
  classOptions: string[];
  subjects: Subject[];
  isMajorSelected: boolean;
  canAutoLoad: boolean;
  onSearchKeywordChange: (value: string) => void;
  onMajorChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const SEMESTER_OPTIONS = [
  { value: 'all', label: 'Tất cả học kỳ' },
  { value: 'HK1-2025', label: 'Học kỳ 1 - 2025' },
  { value: 'HK2-2025', label: 'Học kỳ 2 - 2025' },
  { value: 'HK1-2026', label: 'Học kỳ 1 - 2026' },
];

export function ScoresFilterBar({
  searchKeyword,
  selectedMajor,
  selectedClass,
  selectedSubjectId,
  selectedSemester,
  majorOptions,
  classOptions,
  subjects,
  isMajorSelected,
  canAutoLoad,
  onSearchKeywordChange,
  onMajorChange,
  onClassChange,
  onSubjectChange,
  onSemesterChange,
  onApplyFilters,
  onClearFilters,
}: ScoresFilterBarProps) {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardContent className="grid gap-4 px-6 md:grid-cols-2 xl:grid-cols-5">
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
          <p className="text-sm font-medium text-foreground">Tìm học sinh</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(event) => onSearchKeywordChange(event.target.value)}
              placeholder="Nhập tên hoặc mã học sinh"
              className="pl-9"
              disabled={!isMajorSelected}
            />
          </div>
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
            Học kỳ
          </p>
          <Select
            value={selectedSemester}
            onValueChange={onSemesterChange}
            disabled={!isMajorSelected}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn học kỳ" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTER_OPTIONS.map((semester) => (
                <SelectItem key={semester.value} value={semester.value}>
                  {semester.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 xl:col-span-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
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
