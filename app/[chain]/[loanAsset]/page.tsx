/**
 * Market list page - refactored to use service layer
 */

import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { MarketsTable } from "@/components/markets/markets-table"
import { Badge } from "@/components/ui/badge"
import { getChainIdFromName, capitalizeChainName } from "@/lib/utils/chain-utils"
import { findAssetBySymbol } from "@/lib/services/asset-service"
import { fetchMarkets } from "@/lib/services/market-service"

export default async function MarketListPage({
  params,
}: {
  params: Promise<{ chain: string; loanAsset: string }>
}) {
  const resolvedParams = await params
  const { chain, loanAsset } = resolvedParams
  
  // Map chain name to ID
  let chainId: number
  try {
    chainId = getChainIdFromName(chain)
  } catch {
    notFound()
  }
  
  // Fetch assets for the chain to get loan asset addresses
  const loanAssetData = await findAssetBySymbol(chainId, loanAsset)
  
  if (!loanAssetData) {
    notFound()
  }
  
  // Fetch markets
  const { markets, pageInfo } = await fetchMarkets({
    chainId,
    loanAssetAddresses: loanAssetData.addresses,
  })
  
  const chainLabel = capitalizeChainName(chain)
  const totalCount = pageInfo?.countTotal || markets.length
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{loanAsset} Markets</h1>
          <Badge variant="outline">{chainLabel}</Badge>
        </div>
        <p className="text-muted-foreground">
          Browse all {loanAsset} lending markets on {chainLabel}
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading markets...</div>}>
        <MarketsTable markets={markets} chain={chain} loanAsset={loanAsset} />
      </Suspense>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {markets.length} of {totalCount} markets
      </div>
    </div>
  )
}
