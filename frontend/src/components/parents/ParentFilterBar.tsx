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
import type { ParentStatusFilter } from '@/types/parent';

interface ParentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStatus: ParentStatusFilter;
  onStatusChange: (value: ParentStatusFilter) => void;
}

export function ParentFilterBar({
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: ParentFilterBarProps) {
  const statusSelectValue = selectedStatus || 'all';

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tìm kiếm chi tiết
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên, số điện thoại hoặc email..."
            className="pl-9 bg-muted/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trạng thái tài khoản
        </p>
        <Select
          value={statusSelectValue}
          onValueChange={(value) =>
            onStatusChange(value === 'all' ? '' : (value as ParentStatusFilter))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đã kích hoạt</SelectItem>
            <SelectItem value="inactive">Chưa kích hoạt</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
