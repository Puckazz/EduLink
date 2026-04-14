import { Search, Calendar as CalendarIcon, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AttendanceDetailFilters() {
  return (
    <Card className="p-5 shadow-sm border-slate-200 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
        <div className="flex flex-col gap-2 w-full sm:w-56">
          <label className="text-xs font-bold text-slate-500">Ngày Học</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              defaultValue="10/24/2023" 
              className="pl-9 h-10 font-semibold text-slate-700 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500" 
              readOnly
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-72">
          <label className="text-xs font-bold text-slate-500">Tìm Kiếm Sinh Viên</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Nhập tên hoặc MSSV..." 
              className="pl-9 h-10 border-slate-200 focus-visible:ring-emerald-500 font-medium" 
            />
          </div>
        </div>
      </div>

      <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-bold bg-white shadow-sm w-full md:w-auto md:mb-0.5">
        <CheckCheck className="mr-2 h-4 w-4" />
        Đánh Dấu Tất Cả Có Mặt
      </Button>
    </Card>
  );
}
