import { Download, Save, User, BookOpen, Calendar, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminScoresPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight text-slate-800 dark:text-slate-100">
            Nhập Điểm Sinh Viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Chọn sinh viên và cập nhật kết quả học tập.
          </p>
        </div>
        <Button variant="outline" className="bg-white shadow-sm font-medium">
          <Download className="mr-2 h-4 w-4" />
          Xuất file CSV
        </Button>
      </div>

      {/* Selectors Card */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chọn sinh viên
            </span>
            <Select defaultValue="student1">
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 h-11">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Chọn sinh viên" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student1">Trần Minh Quân (MSSV: 2023001)</SelectItem>
                <SelectItem value="student2">Nguyễn Văn B (MSSV: 2023002)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chọn môn học
            </span>
            <Select defaultValue="subject1">
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 h-11">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Chọn môn học" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subject1">MATH101 - Giải tích 1</SelectItem>
                <SelectItem value="subject2">PHYS101 - Vật lý đại cương</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Học kỳ / Năm học
            </span>
            <Select defaultValue="term1">
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 h-11">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Chọn học kỳ" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Học kỳ 1 - 2023</SelectItem>
                <SelectItem value="term2">Học kỳ 2 - 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table Card */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-700" />
            <CardTitle className="text-lg font-bold">Bảng Điểm Chi Tiết</CardTitle>
          </div>
          <span className="text-sm text-slate-500 font-medium">
            Tổng trọng số: <span className="font-bold text-slate-800 dark:text-slate-200">100%</span>
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
                <TableHead className="w-[30%] font-bold text-slate-500 text-xs tracking-wider">LOẠI ĐÁNH GIÁ</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-center">TRỌNG SỐ</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-center">ĐIỂM TỐI ĐA</TableHead>
                <TableHead className="w-[15%] font-bold text-slate-500 text-xs tracking-wider text-center">KẾT QUẢ</TableHead>
                <TableHead className="w-[25%] font-bold text-slate-500 text-xs tracking-wider">GHI CHÚ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Row 1 */}
              <TableRow>
                <TableCell className="py-4 px-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Điểm Chuyên Cần</div>
                  <div className="text-xs text-slate-500 mt-1">Tham gia lớp học đầy đủ</div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    10%
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium text-slate-600">10</TableCell>
                <TableCell>
                  <Input defaultValue="10" className="text-center font-medium h-10 w-full" />
                </TableCell>
                <TableCell>
                  <Input defaultValue="Đầy đủ" className="h-10" />
                </TableCell>
              </TableRow>

              {/* Row 2 */}
              <TableRow>
                <TableCell className="py-4 px-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Điểm Kiểm Tra</div>
                  <div className="text-xs text-slate-500 mt-1">Bài kiểm tra giữa kỳ / Thường xuyên</div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    30%
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium text-slate-600">10</TableCell>
                <TableCell>
                  <Input defaultValue="8.5" className="text-center font-medium h-10 w-full" />
                </TableCell>
                <TableCell>
                  <Input placeholder="Thêm ghi chú..." className="h-10" />
                </TableCell>
              </TableRow>

              {/* Row 3 */}
              <TableRow>
                <TableCell className="py-4 px-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Thi Cuối Kỳ</div>
                  <div className="text-xs text-amber-500 font-medium mt-1">Đang chờ nhập điểm</div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    60%
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium text-slate-600">10</TableCell>
                <TableCell>
                  <Input 
                    placeholder="--" 
                    className="text-center font-medium border-amber-300 ring-offset-background placeholder:text-slate-400 focus-visible:ring-amber-400 h-10 w-full" 
                  />
                </TableCell>
                <TableCell>
                  <Input placeholder="Thêm ghi chú..." className="h-10" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Footer info inside Card */}
        <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-center sm:justify-end gap-4 border-t border-slate-100">
          <span className="font-bold text-slate-600">Điểm Trung Bình Tạm Tính:</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">3.55 / 4.0</span>
          <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-none font-bold px-3">
            Đạt
          </Badge>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-3 mt-2">
        <Button variant="outline" className="px-6 h-11 text-slate-600 font-semibold border-slate-300 bg-white">
          Hủy bỏ
        </Button>
        <Button className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold">
          <Save className="mr-2 h-4 w-4" />
          Lưu & Cập nhật
        </Button>
      </div>
    </div>
  );
}
