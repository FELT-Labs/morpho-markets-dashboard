/**
 * Market detail page - refactored to use service layer and utilities
 */

import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { CategoryTabs } from "@/components/markets/category-tabs"
import { formatPercentage } from "@/lib/utils"
import { getChainIdFromName, capitalizeChainName } from "@/lib/utils/chain-utils"
import { fetchMarketByUniqueKey } from "@/lib/services/market-service"

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ chain: string; loanAsset: string; uniqueKey: string }>
}) {
  const resolvedParams = await params
  const { chain, loanAsset, uniqueKey } = resolvedParams
  
  // Map chain name to ID
  let chainId: number
  try {
    chainId = getChainIdFromName(chain)
  } catch {
    notFound()
  }
  
  const market = await fetchMarketByUniqueKey(uniqueKey, chainId)

  if (!market) {
    notFound()
  }

  const chainLabel = capitalizeChainName(chain)
  
  // Get net APYs for quick stats
  const netSupplyApy = market.state?.netSupplyApy || market.state?.supplyApy
  const netBorrowApy = market.state?.netBorrowApy || market.state?.borrowApy

  return (
    <div className="container mx-auto py-8 px-4">
      <Link 
        href={`/${chain}/${loanAsset}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {loanAsset} Markets
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-4xl font-bold">
            {market.loanAsset.symbol}
            {market.collateralAsset && (
              <span className="text-muted-foreground"> / {market.collateralAsset.symbol}</span>
            )}
          </h1>
          <Badge variant="outline">{chainLabel}</Badge>
          {market.listed && (
            <Badge variant="default">Listed</Badge>
          )}
          {market.warnings && market.warnings.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {market.warnings.length} Warning{market.warnings.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {market.loanAsset.name}
          {market.collateralAsset && ` / ${market.collateralAsset.name}`}
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Net Supply APY</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPercentage(netSupplyApy)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Net Borrow APY</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatPercentage(netBorrowApy)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Utilization</div>
            <div className="text-2xl font-bold">
              {formatPercentage(market.state?.utilization)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Available Liquidity</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {market.state?.liquidityAssetsUsd ? `$${(market.state.liquidityAssetsUsd / 1000000).toFixed(2)}M` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Tabs */}
      <CategoryTabs market={market} />
    </div>
  )
}
