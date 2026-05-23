'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SubjectFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function SubjectFilterBar({
  search,
  onSearchChange,
}: SubjectFilterBarProps) {
  const hasActiveFilters = search.trim() !== '';

  const handleClearFilters = () => {
    onSearchChange('');
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="subject-search"
          type="search"
          placeholder="Tìm kiếm mã hoặc tên môn học..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          id="subject-clear-filters"
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
