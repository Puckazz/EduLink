'use client';

import { Search, CheckCheck, Calendar, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AttendanceSession } from '@/services/attendance.service';

interface Props {
  search?: string;
  sessions?: AttendanceSession[];
  selectedSession?: AttendanceSession | null;
  isAdmin?: boolean;
  onSessionChange?: (session: AttendanceSession) => void;
  onSearchChange?: (val: string) => void;
  onMarkAllPresent?: () => void;
  onAddSession?: () => void;
  onEditSession?: (session: AttendanceSession) => void;
  onDeleteSession?: (session: AttendanceSession) => void;
}

export function AttendanceDetailFilters({
  search = '',
  sessions = [],
  selectedSession,
  isAdmin = false,
  onSessionChange,
  onSearchChange,
  onMarkAllPresent,
  onAddSession,
  onEditSession,
  onDeleteSession,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      {/* Session date display */}
      {selectedSession && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium shrink-0">
          <Calendar className="h-4 w-4 shrink-0" />
          {new Date(selectedSession.session_date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      )}

      {/* Session selector + session action menu */}
      <div className="flex items-center gap-1">
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

        {/* Action menu for selected session (Admin/Teacher) */}
        {selectedSession && (isAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="Tùy chọn buổi học"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => onEditSession?.(selectedSession)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Sửa ngày buổi học
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onDeleteSession?.(selectedSession)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa buổi học này
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Add session button — Admin or Teacher */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-slate-600 shrink-0"
          onClick={onAddSession}
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm buổi
        </Button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border hidden sm:block" />

      {/* Search */}
      <div className="relative min-w-48 flex-1">
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
        disabled={!selectedSession}
      >
        <CheckCheck className="h-4 w-4" />
        Đánh dấu tất cả Có mặt
      </Button>
    </div>
  );
}
