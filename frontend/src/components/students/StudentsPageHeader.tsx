import { Plus, Download, FileUp, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentsPageHeaderProps {
  onAddStudent: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onExportTemplate: () => void;
  isExporting?: boolean;
  isImporting?: boolean;
}

export function StudentsPageHeader({
  onAddStudent,
  onExportExcel,
  onImportExcel,
  onExportTemplate,
  isExporting = false,
  isImporting = false,
}: StudentsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản Lý Sinh Viên
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tuyển sinh, xem hồ sơ và cập nhật thông tin sinh viên.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onExportTemplate}
          disabled={isExporting || isImporting}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting ? 'Đang tải…' : 'Tải biểu mẫu'}
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onImportExcel}
          disabled={isImporting || isExporting}
        >
          <FileUp className="h-4 w-4" />
          {isImporting ? 'Đang nhập…' : 'Nhập Excel'}
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onExportExcel}
          disabled={isExporting || isImporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Đang xuất…' : 'Xuất Excel'}
        </Button>
        <Button className="gap-2" onClick={onAddStudent}>
          <Plus className="h-4 w-4" />
          Thêm sinh viên
        </Button>
      </div>
    </div>
  );
}

