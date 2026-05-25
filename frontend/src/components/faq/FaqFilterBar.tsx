'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';

interface FaqFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: FeedbackCategory | 'ALL';
  onCategoryChange: (value: FeedbackCategory | 'ALL') => void;
  selectedActive: 'all' | 'active' | 'inactive';
  onActiveChange: (value: 'all' | 'active' | 'inactive') => void;
}

export function FaqFilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedActive,
  onActiveChange,
}: FaqFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedActive !== 'all';

  const handleClearFilters = () => {
    onSearchChange('');
    onCategoryChange('ALL');
    onActiveChange('all');
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="faq-search"
          type="search"
          placeholder="Tìm kiếm câu hỏi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {/* Category filter */}
      <Select
        value={selectedCategory}
        onValueChange={(v) => onCategoryChange(v as FeedbackCategory | 'ALL')}
      >
        <SelectTrigger id="faq-category-filter" className="h-9 w-full sm:w-[200px] text-sm">
          <SelectValue placeholder="Chủ đề" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả chủ đề</SelectItem>
          {(Object.entries(FEEDBACK_CATEGORY_LABELS) as [FeedbackCategory, string][]).map(
            ([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {/* Active status filter */}
      <Select
        value={selectedActive}
        onValueChange={(v) => onActiveChange(v as 'all' | 'active' | 'inactive')}
      >
        <SelectTrigger id="faq-active-filter" className="h-9 w-full sm:w-[180px] text-sm">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="active">Đang hiển thị</SelectItem>
          <SelectItem value="inactive">Đã ẩn</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          id="faq-clear-filters"
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
