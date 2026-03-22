'use client';

import { Search, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StudentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function StudentFilterBar({ search, onSearchChange }: StudentFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      {/* Search */}
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên, MSSV, hoặc phụ huynh..."
          className="pl-9 bg-muted/40"
        />
      </div>

      {/* Major filter */}
      <Button variant="outline" className="gap-2 font-normal text-muted-foreground">
        Tất cả chuyên ngành
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Status filter */}
      <Button variant="outline" className="gap-2 font-normal text-muted-foreground">
        Tất cả trạng thái
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Export */}
      <Button variant="outline" size="icon" className="text-muted-foreground">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
