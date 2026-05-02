import { Download, Save, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AttendanceSession } from '@/services/attendance.service';

interface AttendanceDetailHeaderProps {
  sessionLabel?: string;
  isPublished?: boolean;
  hasDirty?: boolean;
  isSaving?: boolean;
  sessions?: AttendanceSession[];
  selectedSession?: AttendanceSession | null;
  onSessionChange?: (session: AttendanceSession) => void;
  onExportReport?: () => void;
  onSave?: () => void;
}

export function AttendanceDetailHeader({
  sessionLabel = 'Buổi học hiện tại',
  hasDirty = false,
  isSaving = false,
  sessions = [],
  selectedSession,
  onSessionChange,
  onExportReport,
  onSave,
}: AttendanceDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Title + Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Quản Lý Điểm Danh
            </h1>

            {hasDirty && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-500/20">
                Có thay đổi chưa lưu
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">{sessionLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-sm font-semibold text-slate-700 border-slate-200"
            onClick={onExportReport}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Xuất báo cáo
          </Button>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50"
            onClick={onSave}
            disabled={isSaving || !hasDirty}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Đang lưu…' : 'Lưu điểm danh'}
          </Button>
        </div>
      </div>

      {/* Session selector row */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chọn buổi:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sessions.map((sess) => {
              const isSelected = selectedSession?.session_id === sess.session_id;
              return (
                <button
                  key={sess.session_id}
                  onClick={() => onSessionChange?.(sess)}
                  className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  Buổi {sess.session_no}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
