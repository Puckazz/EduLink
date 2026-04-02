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

const chartData = [
  { status: "Có mặt", value: 11454, fill: "#10b981" }, // green-500
  { status: "Vắng mặt", value: 622, fill: "#ef4444" }, // red-500
  { status: "Đi muộn", value: 374, fill: "#eab308" }, // yellow-500
]

const chartConfig = {
  value: {
    label: "Số lượng",
  },
  "Có mặt": {
    label: "Có mặt",
    color: "#10b981",
  },
  "Vắng mặt": {
    label: "Vắng mặt",
    color: "#ef4444",
  },
  "Đi muộn": {
    label: "Đi muộn",
    color: "#eab308",
  },
} satisfies ChartConfig

export function AttendanceSummary() {
  const totalStudents = chartData.reduce((acc, item) => acc + item.value, 0)
  const presentStudents = chartData.find(d => d.status === "Có mặt")?.value || 0
  const presentPercentage = Math.round((presentStudents / totalStudents) * 100)

  return (
    <Card className="flex flex-col shadow-xs border-border h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-foreground">Tóm tắt điểm danh</CardTitle>
        <Badge variant="secondary" className="font-normal text-xs px-2 py-0.5 rounded-md">
          Hôm nay
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-6">
        <div className="relative flex justify-center mt-4 mb-2">
          {/* Donut Chart */}
          <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-[200px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="status"
                innerRadius={65}
                outerRadius={85}
                strokeWidth={0}
                paddingAngle={0}
              />
            </PieChart>
          </ChartContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-foreground">{presentPercentage}%</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">Có mặt</span>
          </div>
        </div>

        {/* Legend / Stats list */}
        <div className="mt-8 space-y-3 px-2">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-medium text-muted-foreground">{item.status}</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
