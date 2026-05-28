'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Major } from '@/types/major';
import type { StudentStatusValue, StudentSortOption } from '@/types/student';

const STATUS_OPTIONS: Array<{ label: string; value: StudentStatusValue }> = [
  { label: 'Đang học', value: 'DANG_HOC' },
  { label: 'Bảo lưu', value: 'BAO_LUU' },
  { label: 'Đình chỉ', value: 'DINH_CHI' },
];

interface StudentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedMajorId: string;
  onMajorChange: (value: string) => void;
  selectedStatus: '' | StudentStatusValue;
  onStatusChange: (value: '' | StudentStatusValue) => void;
  selectedSort: StudentSortOption;
  onSortChange: (value: StudentSortOption) => void;
  majors: Major[];
}

export function StudentFilterBar({
  search,
  onSearchChange,
  selectedMajorId,
  onMajorChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  majors,
}: StudentFilterBarProps) {
  const majorSelectValue = selectedMajorId || 'all';
  const statusSelectValue = selectedStatus || 'all';

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tìm kiếm chi tiết
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, MSSV, hoặc phụ huynh..."
            className="pl-9 bg-muted/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chuyên ngành
        </p>
        <Select
          value={majorSelectValue}
          onValueChange={(value) => onMajorChange(value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả chuyên ngành" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chuyên ngành</SelectItem>
            {majors.map((major) => (
              <SelectItem key={major.major_id} value={String(major.major_id)}>
                {major.major_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trạng thái sinh viên
        </p>
        <Select
          value={statusSelectValue}
          onValueChange={(value) =>
            onStatusChange(value === 'all' ? '' : (value as StudentStatusValue))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sắp xếp
        </p>
        <Select
          value={selectedSort}
          onValueChange={(value) => onSortChange(value as StudentSortOption)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Mới nhất trước</SelectItem>
            <SelectItem value="created_asc">Cũ nhất trước</SelectItem>
            <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
            <SelectItem value="name_desc">Tên (Z-A)</SelectItem>
            <SelectItem value="id_asc">MSSV (Tăng dần)</SelectItem>
            <SelectItem value="id_desc">MSSV (Giảm dần)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
