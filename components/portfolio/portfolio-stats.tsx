import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercent } from "@/lib/utils/format"
import { PortfolioMetrics } from "@/types/portfolio"

interface PortfolioStatsProps {
  metrics: PortfolioMetrics
}

export function PortfolioStats({ metrics }: PortfolioStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Portfolio Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Expected Return</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPercent(metrics.expectedReturn)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Risk (Std Dev)</div>
              <div className="text-2xl font-bold">
                {formatPercent(metrics.expectedRisk)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
              <div className="text-2xl font-bold">
                {metrics.sharpe?.toFixed(2) || '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
