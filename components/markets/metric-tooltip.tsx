import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getMetricExplanation } from "@/lib/metric-explanations"

interface MetricTooltipProps {
  metricKey: string
  children?: React.ReactNode
}

export function MetricTooltip({ metricKey, children }: MetricTooltipProps) {
  const explanation = getMetricExplanation(metricKey)

  if (!explanation) {
    return <>{children || <Info className="h-4 w-4 text-muted-foreground" />}</>
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Info className="h-4 w-4 text-muted-foreground cursor-help inline-block" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm" side="top">
          <div className="space-y-2">
            <p className="font-semibold">{explanation.title}</p>
            <p className="text-sm text-muted-foreground">{explanation.description}</p>
            {explanation.formula && (
              <p className="text-xs font-mono bg-muted/50 p-2 rounded">
                {explanation.formula}
              </p>
            )}
            {explanation.learnMoreUrl && (
              <a
                href={explanation.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-block"
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
