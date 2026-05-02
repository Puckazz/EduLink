'use client';

import { Search, CheckCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AttendanceSession } from '@/services/attendance.service';

interface Props {
  search?: string;
  sessions?: AttendanceSession[];
  selectedSession?: AttendanceSession | null;
  onSessionChange?: (session: AttendanceSession) => void;
  onSearchChange?: (val: string) => void;
  onMarkAllPresent?: () => void;
}

export function AttendanceDetailFilters({
  search = '',
  sessions = [],
  selectedSession,
  onSessionChange,
  onSearchChange,
  onMarkAllPresent,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      {/* Session date display */}
      {selectedSession && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
          <Calendar className="h-4 w-4 shrink-0" />
          {new Date(selectedSession.session_date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      )}

      {/* Session selector */}
      {sessions.length > 0 && (
        <Select
          value={selectedSession?.session_id?.toString() ?? ''}
          onValueChange={(val) => {
            const sess = sessions.find((s) => s.session_id.toString() === val);
            if (sess) onSessionChange?.(sess);
          }}
        >
          <SelectTrigger className="w-36 bg-muted/40">
            <SelectValue placeholder="Chọn buổi" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((sess) => (
              <SelectItem key={sess.session_id} value={sess.session_id.toString()}>
                Buổi {sess.session_no}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Search */}
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Tìm theo tên hoặc mã SV..."
          className="pl-9 bg-muted/40"
        />
      </div>

      {/* Mark all present */}
      <Button
        variant="outline"
        size="default"
        className="shrink-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
        onClick={onMarkAllPresent}
      >
        <CheckCheck className="h-4 w-4" />
        Đánh dấu tất cả Có mặt
      </Button>
    </div>
  );
}
