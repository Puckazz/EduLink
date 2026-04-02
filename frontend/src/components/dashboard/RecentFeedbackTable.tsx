"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const MOCK_FEEDBACKS = [
  {
    id: "1",
    parentName: "Nguyễn Văn A",
    studentName: "Nguyễn Văn B",
    subject: "Thắc mắc điểm Toán",
    date: "24/10/2023",
    status: "Chờ xử lý",
  },
  {
    id: "2",
    parentName: "Trần Thị C",
    studentName: "Lê Thị D",
    subject: "Xin nghỉ phép",
    date: "23/10/2023",
    status: "Đã giải quyết",
  },
]

function getStatusBadge(status: string) {
  if (status === "Chờ xử lý") {
    return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Chờ xử lý</Badge>
  }
  return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Đã giải quyết</Badge>
}

export function RecentFeedbackTable() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-bold text-foreground">Phản hồi gần đây</h2>
        <Button variant="ghost" className="text-sm font-semibold text-foreground px-0 hover:bg-transparent hover:underline hover:text-foreground">
          Xem tất cả
        </Button>
      </div>
      
      <Table>
        <TableHeader className="bg-transparent">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="px-6 h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              TÊN PHỤ HUYNH
            </TableHead>
            <TableHead className="px-4 h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SINH VIÊN
            </TableHead>
            <TableHead className="px-4 h-10 w-1/3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CHỦ ĐỀ
            </TableHead>
            <TableHead className="px-4 h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              NGÀY
            </TableHead>
            <TableHead className="px-6 h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              TRẠNG THÁI
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {MOCK_FEEDBACKS.map((feedback) => (
            <TableRow key={feedback.id} className="border-border">
              <TableCell className="px-6 py-4 font-semibold text-foreground">
                {feedback.parentName}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                {feedback.studentName}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                {feedback.subject}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                {feedback.date}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                {getStatusBadge(feedback.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
