"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  value: { label: "Số lượng" },
  "Có mặt": { label: "Có mặt", color: "#10b981" },
  "Vắng mặt": { label: "Vắng mặt", color: "#ef4444" },
  "Đi muộn": { label: "Đi muộn", color: "#eab308" },
} satisfies ChartConfig

interface AttendanceSummaryProps {
  data?: { present: number; absent: number; late: number }
  isLoading?: boolean
}

export function AttendanceSummary({ data, isLoading = false }: AttendanceSummaryProps) {
  const chartData = [
    { status: "Có mặt",   value: data?.present ?? 0, fill: "#10b981" },
    { status: "Vắng mặt", value: data?.absent  ?? 0, fill: "#ef4444" },
    { status: "Đi muộn",  value: data?.late    ?? 0, fill: "#eab308" },
  ]

  const totalStudents = chartData.reduce((acc, item) => acc + item.value, 0)
  const presentStudents = chartData.find((d) => d.status === "Có mặt")?.value ?? 0
  const presentPercentage = totalStudents > 0
    ? Math.round((presentStudents / totalStudents) * 100)
    : 0

  return (
    <Card className="flex flex-col shadow-xs border-border h-full gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
        <CardTitle className="text-sm font-bold text-foreground">Tóm tắt điểm danh</CardTitle>
        <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5 rounded-md">
          Tổng cộng
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center px-5 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-[150px] w-[150px] rounded-full" />
            <div className="w-full space-y-2 px-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex justify-center mb-2">
              <ChartContainer config={chartConfig} className="h-[160px] w-full max-w-[160px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={75}
                    strokeWidth={0}
                    paddingAngle={0}
                  />
                </PieChart>
              </ChartContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">
                  {totalStudents > 0 ? `${presentPercentage}%` : "—"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Có mặt</span>
              </div>
            </div>

            <div className="space-y-2 px-1">
              {chartData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-medium text-muted-foreground">{item.status}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
