"use client"

import { Users, UserSquare2, Send, Clock3 } from "lucide-react"
import { StatCard } from "./StatCard"
import { PerformanceChart } from "./PerformanceChart"
import { AttendanceSummary } from "./AttendanceSummary"
import { RecentFeedbackTable } from "./RecentFeedbackTable"
import { useAdminDashboard } from "@/hooks/queries/useAdminDashboard"

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 rounded-xl bg-slate-100" />
        <div className="h-64 rounded-xl bg-slate-100" />
      </div>
      <div className="h-48 rounded-xl bg-slate-100" />
    </div>
  )
}

export function DashboardPageClient() {
  const { data, isPending } = useAdminDashboard()

  if (isPending) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng sinh viên"
          value={data?.totalStudents.toLocaleString() ?? "—"}
          icon={Users}
          iconColor="text-blue-700"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Tổng phụ huynh"
          value={data?.totalParents.toLocaleString() ?? "—"}
          icon={UserSquare2}
          iconColor="text-purple-700"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Thông báo đã gửi"
          value={data?.totalNotifications.toLocaleString() ?? "—"}
          icon={Send}
          iconColor="text-orange-700"
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Phản hồi chờ xử lý"
          value={data?.pendingFeedbacks ?? "—"}
          icon={Clock3}
          iconColor="text-red-700"
          iconBg="bg-red-100"
          trendLabel="Xem xét"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <AttendanceSummary data={data?.attendanceSummary} isLoading={false} />
        </div>
      </div>

      <div>
        <RecentFeedbackTable
          feedbacks={data?.recentFeedbacks ?? []}
          isLoading={false}
        />
      </div>
    </div>
  )
}
