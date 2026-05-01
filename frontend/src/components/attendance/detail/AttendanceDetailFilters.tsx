'use client';

import { Search, Calendar as CalendarIcon, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Props {
  search?: string;
  sessionDate?: string;
  onSearchChange?: (val: string) => void;
  onMarkAllPresent?: () => void;
}

export function AttendanceDetailFilters({
  search = '',
  sessionDate,
  onSearchChange,
  onMarkAllPresent,
}: Props) {
  return (
    <Card className="p-4 shadow-sm border-slate-200 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        {/* Session date — read-only display */}
        {sessionDate && (
          <div className="flex flex-col gap-1.5 w-full sm:w-52">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Ngày học
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={sessionDate}
                className="pl-9 h-10 font-semibold text-slate-700 bg-slate-50 border-slate-200 focus-visible:ring-0"
                readOnly
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-col gap-1.5 w-full sm:w-72">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Tìm kiếm sinh viên
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Nhập tên hoặc mã SV..."
              className="pl-9 h-10 border-slate-200 font-medium focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-bold bg-white shadow-sm w-full md:w-auto"
        onClick={onMarkAllPresent}
      >
        <CheckCheck className="mr-2 h-4 w-4" />
        Đánh dấu tất cả Có mặt
      </Button>
    </Card>
  );
}
