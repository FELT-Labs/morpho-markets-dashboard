import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { graphQLClient } from "@/lib/graphql/client"
import { GET_MARKETS_QUERY, GET_ASSETS_QUERY } from "@/lib/graphql/queries"
import { MarketsTable } from "@/components/markets/markets-table"
import { Badge } from "@/components/ui/badge"
import { getChainIdFromName } from "@/lib/utils"
import type { MarketsResponse } from "@/types"

interface Asset {
  id: string
  symbol: string
  address: string
  name: string
  logoURI?: string | null
  chain: {
    id: number
    network: string
  }
}

async function getAssets(chainId: number) {
  try {
    const data = await graphQLClient.request<{ assets: { items: Asset[] } }>(GET_ASSETS_QUERY, {
      first: 1000,
      chainId_in: [chainId],
    })
    
    // Group assets by symbol and collect all addresses
    const assetsBySymbol = new Map<string, { symbol: string; addresses: string[] }>()
    
    data.assets.items.forEach((asset) => {
      if (!assetsBySymbol.has(asset.symbol)) {
        assetsBySymbol.set(asset.symbol, {
          symbol: asset.symbol,
          addresses: [],
        })
      }
      assetsBySymbol.get(asset.symbol)!.addresses.push(asset.address)
    })
    
    return Array.from(assetsBySymbol.values())
  } catch (error) {
    console.error("Failed to fetch assets:", error)
    return []
  }
}

async function getMarkets(
  chainId: number,
  loanAssetAddresses: string[] | undefined
) {
  try {
    const data = await graphQLClient.request<MarketsResponse>(GET_MARKETS_QUERY, {
      first: 200,
      skip: 0,
      chainId_in: [chainId],
      loanAssetAddress_in: loanAssetAddresses,
      orderBy: "SupplyAssetsUsd",
      orderDirection: "Desc",
    })
    
    return {
      markets: data.markets.items,
      pageInfo: data.markets.pageInfo,
    }
  } catch (error) {
    console.error("Failed to fetch markets:", error)
    return {
      markets: [],
      pageInfo: undefined,
    }
  }
}

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
  const assets = await getAssets(chainId)
  const loanAssetData = assets.find(a => a.symbol.toUpperCase() === loanAsset.toUpperCase())
  
  if (!loanAssetData) {
    notFound()
  }
  
  // Fetch markets
  const { markets, pageInfo } = await getMarkets(chainId, loanAssetData.addresses)
  
  const chainLabel = chain.charAt(0).toUpperCase() + chain.slice(1)
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
