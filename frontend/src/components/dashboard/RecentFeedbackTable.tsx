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
import type { AdminRecentFeedback } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { formatDate } from "@/utils"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "Chờ xử lý",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  RESOLVED: {
    label: "Đã giải quyết",
    className: "bg-green-100 text-green-700 border-green-200",
  },
}

function getStatusBadge(status: string) {
  const cfg = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  }
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

interface RecentFeedbackTableProps {
  feedbacks?: AdminRecentFeedback[]
  isLoading?: boolean
}

export function RecentFeedbackTable({
  feedbacks = [],
  isLoading = false,
}: RecentFeedbackTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-border border-b">
        <h2 className="text-lg font-bold text-foreground">Phản hồi gần đây</h2>
        <Button
          asChild
          variant="ghost"
          className="text-sm font-semibold text-foreground px-0 hover:bg-transparent hover:underline hover:text-foreground"
        >
          <Link href="/admin/feedbacks">Xem tất cả</Link>
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-transparent">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="px-6 h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              TÊN PHỤ HUYNH
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
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : feedbacks.map((feedback) => (
                <TableRow key={feedback.feedback_id} className="border-border">
                  <TableCell className="px-6 py-4 font-semibold text-foreground">
                    {feedback.parent.full_name}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                    {feedback.title}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(feedback.created_at)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {getStatusBadge(feedback.status)}
                  </TableCell>
                </TableRow>
              ))}

          {!isLoading && feedbacks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="px-6 py-10 text-center text-sm text-muted-foreground"
              >
                Chưa có phản hồi nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
