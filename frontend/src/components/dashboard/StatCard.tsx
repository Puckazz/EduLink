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
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              isPositive ? "text-green-600" : "",
              isNegative ? "text-red-600" : "text-muted-foreground",
            )}
          >
            {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
            {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
            {!isPositive && !isNegative && <TrendingUp className="h-3.5 w-3.5" />}
            {isPositive ? "+" : ""}
            {trend}%
          </div>
        )}

        {trendLabel && (
          <span className="text-xs font-semibold text-foreground">{trendLabel}</span>
        )}
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  )
}
