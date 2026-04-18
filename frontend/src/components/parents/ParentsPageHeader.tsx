import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParentsPageHeaderProps {
  totalItems: number;
  onExport: () => void;
  onAddParent: () => void;
}

export function ParentsPageHeader({
  totalItems,
  onExport,
  onAddParent,
}: ParentsPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản Lý Phụ huynh
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng cộng:{' '}
          <span className="font-semibold text-foreground">{totalItems}</span>{' '}
          phụ huynh trong hệ thống
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={onExport}>
          <Download className="h-4 w-4" />
          Xuất dữ liệu
        </Button>
        <Button className="gap-2" onClick={onAddParent}>
          <Plus className="h-4 w-4" />
          Thêm phụ huynh mới
        </Button>
      </div>
    </div>
  );
}
