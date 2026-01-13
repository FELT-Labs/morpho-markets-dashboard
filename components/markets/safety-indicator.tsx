/**
 * Safety indicator component - refactored with risk calculator
 */

import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { Market } from "@/types"
import { useMarketRisk } from "@/hooks/use-market-risk"

interface SafetyIndicatorProps {
  market: Market
  showDetails?: boolean
}

export function SafetyIndicator({ market, showDetails = false }: SafetyIndicatorProps) {
  const risk = useMarketRisk(market)
  const Icon = risk.icon
  
  if (!showDetails) {
    // Compact badge version for table
    return (
      <Badge 
        variant={risk.colorClasses.badgeVariant}
        className={risk.level === 'medium' ? `${risk.colorClasses.text} ${risk.colorClasses.border}` : ''}
      >
        <Icon className="h-3 w-3 mr-1" />
        {risk.label}
      </Badge>
    )
  }
  
  // Detailed version for detail pages
  return (
    <div className={`p-4 rounded-lg border ${risk.colorClasses.bg} ${risk.colorClasses.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${risk.colorClasses.text}`} />
        <span className={`font-semibold ${risk.colorClasses.text}`}>
          {risk.label}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">LLTV:</span>
          <span className="font-medium">{risk.lltv.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Utilization:</span>
          <span className="font-medium">{(risk.utilization * 100).toFixed(2)}%</span>
        </div>
        {risk.hasWarnings && (
          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{market.warnings!.length} warning{market.warnings!.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {risk.hasBadDebt && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-3 w-3" />
            <span>Bad debt detected</span>
          </div>
        )}
      </div>
    </div>
  )
}
