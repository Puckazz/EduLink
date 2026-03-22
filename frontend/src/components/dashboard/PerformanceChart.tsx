"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChevronDown } from "lucide-react"

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
import { Button } from "@/components/ui/button"

const chartData = [
  { major: "Kỹ thuật", gpa: 3.4, fill: "#263c5a" },
  { major: "Nghệ thuật", gpa: 2.8, fill: "#657386" },
  { major: "Khoa học", gpa: 3.6, fill: "#263c5a" },
  { major: "Kinh doanh", gpa: 3.1, fill: "#657386" },
  { major: "Luật", gpa: 3.2, fill: "#263c5a" },
]

const chartConfig = {
  gpa: {
    label: "GPA",
  },
} satisfies ChartConfig

export function PerformanceChart() {
  return (
    <Card className="flex flex-col shadow-xs border-border h-full">
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div>
          <CardTitle className="text-lg text-foreground">Tổng quan kết quả học tập</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            GPA trung bình theo khoa
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 font-normal text-muted-foreground">
          Kỳ Thu 2023
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 0,
            }}
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
            {/* YAxis is implicitly hidden in shadcn charts unless styled, added for scale */}
            <YAxis hide domain={[0, 4]} />
            <ChartTooltip
              cursor={{ fill: 'transparent' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey="gpa" 
              radius={4}
              background={{ fill: '#f1f5f9', radius: 4 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
