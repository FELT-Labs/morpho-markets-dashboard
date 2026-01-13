/**
 * Oracle health badge component - refactored with oracle utilities
 */

import { Badge } from "@/components/ui/badge"
import { Database, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"
import { OracleType } from "@/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  getOracleLabel, 
  getOracleHealthStatus, 
  getOracleDescription 
} from "@/lib/utils/oracle-utils"

interface OracleHealthBadgeProps {
  oracleType?: OracleType
  hasOracleWarning?: boolean
  showIcon?: boolean
  compact?: boolean
}

export function OracleHealthBadge({ 
  oracleType, 
  hasOracleWarning = false,
  showIcon = true,
  compact = false
}: OracleHealthBadgeProps) {
  if (!oracleType) {
    return (
      <Badge variant="outline" className="gap-1">
        <HelpCircle className="h-3 w-3" />
        No Oracle
      </Badge>
    )
  }
  
  const status = getOracleHealthStatus(oracleType, hasOracleWarning)
  const description = getOracleDescription(oracleType, hasOracleWarning)
  const label = getOracleLabel(oracleType, compact)
  
  const icon = Database
  let statusIcon = CheckCircle2
  let statusColor = 'text-green-600 dark:text-green-400'
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary"
  
  if (status === 'warning') {
    statusIcon = AlertCircle
    statusColor = 'text-yellow-600 dark:text-yellow-400'
    variant = "outline"
  } else if (status === 'unknown') {
    statusIcon = HelpCircle
    statusColor = 'text-gray-600 dark:text-gray-400'
    variant = "outline"
  }
  
  const Icon = showIcon ? icon : null
  const StatusIcon = statusIcon
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1">
            {Icon && <Icon className="h-3 w-3" />}
            {label}
            <StatusIcon className={`h-3 w-3 ${statusColor}`} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
