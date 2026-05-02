import { Download, Save, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AttendanceDetailHeaderProps {
  sessionLabel?: string;
  hasDirty?: boolean;
  isSaving?: boolean;
  onExportReport?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
}

export function AttendanceDetailHeader({
  sessionLabel = 'Buổi học hiện tại',
  hasDirty = false,
  isSaving = false,
  onExportReport,
  onSave,
  onUndo,
}: AttendanceDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">
            Quản Lý Điểm Danh
          </h1>
          {hasDirty && (
            <Badge variant="secondary" className="text-blue-600 bg-blue-50 border-blue-200 font-semibold">
              Có thay đổi chưa lưu
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">{sessionLabel}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportReport}
        >
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!hasDirty}
        >
          <Undo2 className="h-4 w-4" />
          Hoàn tác
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasDirty}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Đang lưu…' : 'Lưu điểm danh'}
        </Button>
      </div>
    </div>
  );
}
