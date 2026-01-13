import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MetricTooltip } from "./metric-tooltip"

interface MetricCardProps {
  title: string
  value: string | number
  metricKey?: string
  description?: string
  subtitle?: string
  className?: string
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  valueClassName?: string
}

export function MetricCard({
  title,
  value,
  metricKey,
  description,
  subtitle,
  className,
  badge,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {metricKey && <MetricTooltip metricKey={metricKey} />}
          </div>
          {badge && (
            <Badge variant={badge.variant || "default"} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={cn("text-2xl font-bold transition-colors", valueClassName)}>{value}</div>
        </div>
        {subtitle && (
          <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>
        )}
        {description && (
          <CardDescription className="text-xs mt-1">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  )
}
