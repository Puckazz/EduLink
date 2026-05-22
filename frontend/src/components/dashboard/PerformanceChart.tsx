"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  gpa: { label: "GPA" },
} satisfies ChartConfig

const BAR_COLORS = ["#263c5a", "#657386"]

interface PerformanceChartProps {
  data?: { major: string; gpa: number }[]
  isLoading?: boolean
}

export function PerformanceChart({ data = [], isLoading = false }: PerformanceChartProps) {
  return (
    <Card className="flex flex-col shadow-xs border-border h-full py-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg text-foreground">Tổng quan kết quả học tập</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            GPA trung bình theo khoa
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex items-end gap-4 h-[250px] px-4">
            {[70, 50, 80, 60, 75].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu điểm.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              barSize={45}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="major"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs text-muted-foreground font-medium"
              />
              <YAxis hide domain={[0, 4]} />
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="gpa" radius={4} background={{ fill: "#f1f5f9", radius: 4 }}>
                {data.map((_, index) => (
                  <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
