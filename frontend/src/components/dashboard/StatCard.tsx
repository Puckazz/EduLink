import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: number
  trendLabel?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
}: StatCardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <Card className="shadow-xs border-border py-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className={cn("p-2 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              isPositive ? "bg-green-100 text-green-700" : "",
              isNegative ? "bg-red-100 text-red-700" : "",
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}
            {trend}%
          </div>
        )}
        {trendLabel && <div className="text-xs font-semibold text-foreground">{trendLabel}</div>}
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground mt-4 mb-1">{title}</p>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}
