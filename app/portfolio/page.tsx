import { getMarketsWithHistory } from "@/lib/services/market-service"
import { getMultipleVaultAllocations } from "@/lib/services/vault-service"
import { VAULT_ADDRESSES } from "@/lib/constants"
import {
  optimizePortfolio,
  getBenchmarkPortfolio,
  calculatePortfolioMetrics,
  calculatePortfolioPerformanceSeries,
} from "@/lib/services/portfolio-optimization-service"
import { PortfolioStats } from "../../components/portfolio/portfolio-stats"
import { PortfolioAllocationTable } from "../../components/portfolio/portfolio-allocation-table"
import { PortfolioPerformanceChart } from "../../components/portfolio/portfolio-performance-chart"

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const [markets, vaults] = await Promise.all([
    getMarketsWithHistory('ethereum', 'usdc', 100, 500000, 30),
    getMultipleVaultAllocations(VAULT_ADDRESSES.ethereum.usdc, 1)
  ])

  const optimizationResult = await optimizePortfolio(markets)

  const sovaVault = vaults.find(v => 
    v.name.toLowerCase().includes('sova') || 
    v.symbol.toLowerCase().includes('sova')
  )
  const sovaPortfolio = getBenchmarkPortfolio(sovaVault, markets)
  const sovaMetrics = calculatePortfolioMetrics(sovaPortfolio)
  const performanceSeries = calculatePortfolioPerformanceSeries([
    { key: 'recommended', items: optimizationResult?.items ?? [] },
    { key: 'sova', items: sovaPortfolio },
  ])

  if (!optimizationResult) {
    return <div className="p-8">No valid market data available for optimization.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Optimized Portfolio</h1>
        <p className="text-muted-foreground">
          Built from 30-day Morpho APY history after excluding markets below $500k liquidity and temporary PT markets.
          The optimizer targets 7-8% APY while minimizing APY variance.
        </p>
      </div>

      <PortfolioStats metrics={optimizationResult} benchmarkMetrics={sovaMetrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <PortfolioAllocationTable 
          title="Recommended Portfolio"
          items={optimizationResult.items}
          badgeText="Target 7-8%"
          badgeVariant="secondary"
          barColorClass="bg-blue-600"
        />

        <PortfolioAllocationTable 
          title="Sova Vault Allocation"
          items={sovaPortfolio}
          badgeText="Benchmark"
          badgeVariant="outline"
          barColorClass="bg-purple-500"
          emptyMessage="No active Sova vault allocations found."
        />
      </div>

      <div className="mt-8">
        <PortfolioPerformanceChart data={performanceSeries} />
      </div>
    </div>
  )
}
