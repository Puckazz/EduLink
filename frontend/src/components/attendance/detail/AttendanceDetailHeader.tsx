import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AttendanceDetailHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Quản Lý Điểm Danh
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Điểm danh hàng ngày cho lớp Sinh Học 101.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="bg-white shadow-sm font-semibold text-slate-700">
          <Download className="mr-2 h-4 w-4" />
          Xuất Báo Cáo
        </Button>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm">
          <Save className="mr-2 h-4 w-4" />
          Lưu Điểm Danh
        </Button>
      </div>
    </div>
  );
}
