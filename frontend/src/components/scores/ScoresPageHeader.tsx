import {
  Download,
  FileUp,
  MegaphoneOff,
  Megaphone,
  FileSpreadsheet,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoresPageHeaderProps {
  selectedCount: number;
  totalCount: number;
  canPublish: boolean;
  canUnpublish: boolean;
  onPublishSelected: () => void;
  onUnpublishSelected: () => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onExportTemplate: () => void;
  onOpenLogs: () => void;
}

export function ScoresPageHeader({
  selectedCount,
  totalCount,
  canPublish,
  canUnpublish,
  onPublishSelected,
  onUnpublishSelected,
  onImportExcel,
  onExportExcel,
  onExportTemplate,
  onOpenLogs,
}: ScoresPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý điểm theo lớp
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập/Xuất Excel, chỉnh sửa hàng loạt và công bố kết quả cho toàn
          trường.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={onExportTemplate}>
          <FileSpreadsheet className="h-4 w-4" />
          Tải biểu mẫu
        </Button>
        <Button variant="outline" className="gap-2" onClick={onImportExcel}>
          <FileUp className="h-4 w-4" />
          Nhập Excel
        </Button>
        <Button variant="outline" className="gap-2" onClick={onExportExcel}>
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
        <Button variant="outline" className="gap-2" onClick={onOpenLogs}>
          <History className="h-4 w-4" />
          Nhật ký
        </Button>

        <div className="ml-2 flex items-center gap-2 border-l border-border pl-4">
          {selectedCount > 0 && (
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Đã chọn: <span className="text-foreground">{selectedCount}</span> bản ghi
            </span>
          )}
          <Button
            variant="outline"
            className="gap-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onUnpublishSelected}
            disabled={totalCount === 0 || !canUnpublish}
          >
            <MegaphoneOff className="h-4 w-4" />
            {selectedCount > 0 ? 'Hủy công bố' : 'Hủy công bố tất cả'}
          </Button>
          <Button 
            className="gap-2" 
            onClick={onPublishSelected}
            disabled={totalCount === 0 || !canPublish}
          >
            <Megaphone className="h-4 w-4" />
            {selectedCount > 0 ? 'Công bố đã chọn' : 'Công bố tất cả'}
          </Button>
        </div>
      </div>
    </div>
  );
}
