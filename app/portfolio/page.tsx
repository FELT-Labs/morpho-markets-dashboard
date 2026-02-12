import { getMarketsWithHistory } from "@/lib/services/market-service"
import { getMultipleVaultAllocations } from "@/lib/services/vault-service"
import { VAULT_ADDRESSES } from "@/lib/constants"
import { optimizePortfolio, getBenchmarkPortfolio } from "@/lib/services/portfolio-optimization-service"
import { PortfolioStats } from "../../components/portfolio/portfolio-stats"
import { PortfolioAllocationTable } from "../../components/portfolio/portfolio-allocation-table"

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  // 1. Data Fetching
  const [markets, vaults] = await Promise.all([
    getMarketsWithHistory('ethereum', 'usdc', 100, 500000),
    getMultipleVaultAllocations(VAULT_ADDRESSES.ethereum.usdc, 1)
  ])

  // 2. Logic & Optimization
  const optimizationResult = await optimizePortfolio(markets)
  
  const sovaVault = vaults.find(v => 
    v.name.toLowerCase().includes('sova') || 
    v.symbol.toLowerCase().includes('sova')
  )
  const sovaPortfolio = getBenchmarkPortfolio(sovaVault, markets)

  if (!optimizationResult) {
    return <div className="p-8">No valid market data available for optimization.</div>
  }

  // 3. Render Composition
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Optimal Mean-Variance Portfolio</h1>
        <p className="text-muted-foreground">
          Based on 7-day historical APY of top 100 Morpho markets.
          Optimized for Maximum Sharpe Ratio.
        </p>
      </div>

      <PortfolioStats metrics={optimizationResult} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <PortfolioAllocationTable 
          title="Recommended Portfolio"
          items={optimizationResult.items}
          badgeText="Top 10"
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
    </div>
  )
}
