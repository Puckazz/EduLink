"use client"

import { Users, UserSquare2, Send, Clock3 } from "lucide-react"
import { StatCard } from "./StatCard"
import { PerformanceChart } from "./PerformanceChart"
import { AttendanceSummary } from "./AttendanceSummary"
import { RecentFeedbackTable } from "./RecentFeedbackTable"

export function DashboardPageClient() {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng sinh viên"
          value="12,450"
          icon={Users}
          iconColor="text-blue-700"
          iconBg="bg-blue-100"
          trend={5}
        />
        <StatCard
          title="Tổng phụ huynh"
          value="8,200"
          icon={UserSquare2}
          iconColor="text-purple-700"
          iconBg="bg-purple-100"
          trend={2}
        />
        <StatCard
          title="Thông báo đã gửi"
          value="1,042"
          icon={Send}
          iconColor="text-orange-700"
          iconBg="bg-orange-100"
          trend={12}
        />
        <StatCard
          title="Phản hồi chờ xử lý"
          value="18"
          icon={Clock3}
          iconColor="text-red-700"
          iconBg="bg-red-100"
          trendLabel="Xem xét"
        />
      </div>

      {/* Middle Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <AttendanceSummary />
        </div>
      </div>

      {/* Bottom Table Row */}
      <div>
        <RecentFeedbackTable />
      </div>
    </div>
  )
}
