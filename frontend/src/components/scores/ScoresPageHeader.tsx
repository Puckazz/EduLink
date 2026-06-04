import {
  Download,
  FileUp,
  MegaphoneOff,
  Megaphone,
  FileSpreadsheet,
  History,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoresPageHeaderProps {
  selectedCount: number;
  totalCount: number;
  canPublish: boolean;
  canUnpublish: boolean;
  onCreateScore: () => void;
  onPublishSelected: () => void;
  onUnpublishSelected: () => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onExportTemplate: () => void;
  onOpenLogs: () => void;
  isExporting?: boolean;
  isImporting?: boolean;
}

export function ScoresPageHeader({
  selectedCount,
  totalCount,
  canPublish,
  canUnpublish,
  onCreateScore,
  onPublishSelected,
  onUnpublishSelected,
  onImportExcel,
  onExportExcel,
  onExportTemplate,
  onOpenLogs,
  isExporting = false,
  isImporting = false,
}: ScoresPageHeaderProps) {
  const isBusy = isExporting || isImporting;

  return (
    <div className="flex flex-col gap-3">
      {/* Title row */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Quản lý điểm theo lớp
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập/Xuất Excel, chỉnh sửa hàng loạt và công bố kết quả cho toàn trường.
        </p>
      </div>

      {/* Action rows */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* File actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onCreateScore}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Thêm điểm
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onExportTemplate}
            disabled={isBusy}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {isExporting ? 'Đang tải…' : 'Tải biểu mẫu'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onImportExcel}
            disabled={isBusy}
          >
            <FileUp className="h-3.5 w-3.5" />
            {isImporting ? 'Đang nhập…' : 'Nhập Excel'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onExportExcel}
            disabled={isBusy}
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? 'Đang xuất…' : 'Xuất Excel'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onOpenLogs}
          >
            <History className="h-3.5 w-3.5" />
            Nhật ký
          </Button>
        </div>

        {/* Divider — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:block h-6 w-px bg-border mx-1" />

        {/* Publish actions */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              Đã chọn: <span className="text-foreground">{selectedCount}</span> bản ghi
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs sm:text-sm border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onUnpublishSelected}
            disabled={totalCount === 0 || !canUnpublish}
          >
            <MegaphoneOff className="h-3.5 w-3.5" />
            {selectedCount > 0 ? 'Hủy công bố' : 'Hủy công bố tất cả'}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs sm:text-sm"
            onClick={onPublishSelected}
            disabled={totalCount === 0 || !canPublish}
          >
            <Megaphone className="h-3.5 w-3.5" />
            {selectedCount > 0 ? 'Công bố đã chọn' : 'Công bố tất cả'}
          </Button>
        </div>
      </div>
    </div>
  );
}
