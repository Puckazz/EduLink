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
import type { TeacherSortOption } from '@/types/teacher';

interface TeacherFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSort: TeacherSortOption;
  onSortChange: (value: TeacherSortOption) => void;
}

export function TeacherFilterBar({
  search,
  onSearchChange,
  selectedSort,
  onSortChange,
}: TeacherFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:grid-cols-[1fr_240px]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tìm kiếm chi tiết
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên, tài khoản, email hoặc số điện thoại..."
            className="bg-muted/40 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sắp xếp
        </p>
        <Select
          value={selectedSort}
          onValueChange={(value) => onSortChange(value as TeacherSortOption)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Mới nhất trước</SelectItem>
            <SelectItem value="created_asc">Cũ nhất trước</SelectItem>
            <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
            <SelectItem value="name_desc">Tên (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
