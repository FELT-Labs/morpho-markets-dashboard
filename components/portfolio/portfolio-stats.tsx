import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPercent } from "@/lib/utils/format"
import { BenchmarkPortfolioMetrics, PortfolioMetrics } from "@/types/portfolio"

interface PortfolioStatsProps {
  metrics: PortfolioMetrics
  benchmarkMetrics?: BenchmarkPortfolioMetrics | null
}

export function PortfolioStats({ metrics, benchmarkMetrics }: PortfolioStatsProps) {
  return (
    <div className="grid gap-6 mb-8">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Optimized Portfolio Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <StatValue label="Current APY" value={formatPercent(metrics.currentApy)} tone="positive" />
            <StatValue label="7d Avg APY" value={formatPercent(metrics.average7dApy)} tone="positive" />
            <StatValue label="Risk (Std Dev)" value={formatPercent(metrics.expectedRisk)} />
            <StatValue label="Sharpe Ratio" value={metrics.sharpe?.toFixed(2) || '-'} />
            <StatValue label="Eligible Markets" value={String(metrics.eligibleMarkets)} />
          </div>
        </CardContent>
      </Card>

      {benchmarkMetrics && (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Sova Vault Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <StatValue label="Current APY" value={formatPercent(benchmarkMetrics.currentApy)} tone="positive" />
              <StatValue label="7d Avg APY" value={formatPercent(benchmarkMetrics.average7dApy)} tone="positive" />
              <StatValue label="Risk (Std Dev)" value={formatPercent(benchmarkMetrics.expectedRisk)} />
              <StatValue label="Sharpe Ratio" value={benchmarkMetrics.sharpe?.toFixed(2) || '-'} />
              <StatValue label="Active Markets" value={String(benchmarkMetrics.activeMarkets)} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatValue({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'positive'
}) {
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className={tone === 'positive' ? "text-2xl font-bold text-green-600" : "text-2xl font-bold"}>
        {value}
      </div>
    </div>
  )
}
