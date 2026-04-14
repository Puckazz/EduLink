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
  isFullyPublished: boolean;
  publishedCount: number;
  totalCount: number;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onExportTemplate: () => void;
  onTogglePublish: () => void;
  onOpenLogs: () => void;
}

export function ScoresPageHeader({
  isFullyPublished,
  publishedCount,
  totalCount,
  onImportExcel,
  onExportExcel,
  onExportTemplate,
  onTogglePublish,
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
        <Button className="gap-2" onClick={onTogglePublish}>
          {isFullyPublished ? (
            <>
              <MegaphoneOff className="h-4 w-4" />
              Hủy công bố
            </>
          ) : (
            <>
              <Megaphone className="h-4 w-4" />
              Công bố
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
