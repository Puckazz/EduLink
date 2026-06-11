"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useGpaByMajor } from "@/hooks/queries/useGpaByMajor"

const BAR_COLORS = ["#263c5a", "#657386"]

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { major: string; gpa: number } }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-foreground">{item.major}</p>
      <p className="text-sm text-muted-foreground">
        GPA: <span className="font-semibold text-foreground">{item.gpa.toFixed(2)}</span>
        <span className="text-xs"> / 10</span>
      </p>
    </div>
  )
}

function truncateLabel(value: string, maxLen = 12): string {
  if (value.length <= maxLen) return value
  return value.slice(0, maxLen) + "…"
}

function CustomXAxisTick({
  x,
  y,
  payload,
}: {
  x?: number
  y?: number
  payload?: { value: string }
}) {
  if (!payload) return null
  const label = payload.value
  const words = label.split(" ")
  const lines: string[] = []
  let current = ""

  words.forEach((word) => {
    if (current.length + word.length + 1 <= 14) {
      current = current ? `${current} ${word}` : word
    } else {
      if (current) lines.push(current)
      current = word
    }
  })
  if (current) lines.push(current)

  const displayLines = lines.slice(0, 2)
  if (lines.length > 2) {
    displayLines[1] = truncateLabel(displayLines[1], 11)
  }

  return (
    <g transform={`translate(${x},${y})`}>
      {displayLines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 14}
          dy={12}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 11 }}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

export function PerformanceChart() {
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined)

  const { data: response, isPending } = useGpaByMajor(selectedTermId)

  const terms = response?.terms ?? []
  const chartData = response?.gpaByMajor ?? []

  const maxGpa = chartData.length > 0 ? Math.max(...chartData.map((d) => d.gpa)) : 10
  const yMax = Math.min(10, Math.ceil(maxGpa + 1))

  const handleTermChange = (value: string) => {
    if (value === "all") {
      setSelectedTermId(undefined)
    } else {
      setSelectedTermId(parseInt(value, 10))
    }
  }

  return (
    <Card className="flex flex-col shadow-xs border-border h-full gap-0">
      <CardHeader className="flex flex-row items-start justify-between px-5 py-4">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">
            Tổng quan kết quả học tập
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            GPA trung bình theo khoa (thang điểm 10)
          </CardDescription>
        </div>
        <Select
          value={selectedTermId !== undefined ? String(selectedTermId) : "all"}
          onValueChange={handleTermChange}
        >
          <SelectTrigger className="w-45 h-8 text-xs">
            <SelectValue placeholder="Chọn kỳ học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả các kỳ</SelectItem>
            {terms.map((term) => (
              <SelectItem key={term.term_id} value={String(term.term_id)}>
                {term.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 px-4 pb-2">
        {isPending ? (
          <div className="flex items-end gap-4 h-70 px-4">
            {[70, 50, 80, 60, 75].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-70 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu điểm.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 8, left: -8, bottom: chartData.some((d) => d.major.length > 12) ? 24 : 8 }}
              barSize={42}
              barCategoryGap="20%"
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#d1d5db"
              />
              <XAxis
                dataKey="major"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={<CustomXAxisTick />}
                height={50}
              />
              <YAxis
                domain={[0, yMax]}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="text-xs fill-muted-foreground"
                width={28}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="gpa"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="gpa"
                  position="top"
                  formatter={(v: number) => v.toFixed(2)}
                  className="fill-foreground"
                  style={{ fontSize: 12, fontWeight: 600 }}
                />
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
