import { Suspense } from "react"
import { graphQLClient } from "@/lib/graphql/client"
import { GET_MARKETS_QUERY, GET_ASSETS_QUERY } from "@/lib/graphql/queries"
import { MarketFilterCard } from "@/components/markets/market-filter-card"
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

async function getAssets(chainId: number, symbol: string) {
  try {
    const data = await graphQLClient.request<{ assets: { items: Asset[] } }>(GET_ASSETS_QUERY, {
      first: 1000,
      chainId_in: [chainId],
    })
    
    // Find all addresses for the given symbol
    const addresses = data.assets.items
      .filter(asset => asset.symbol === symbol)
      .map(asset => asset.address)
    
    return addresses
  } catch (error) {
    console.error("Failed to fetch assets:", error)
    return []
  }
}

async function getEthereumUSDCStats() {
  try {
    // First, get all USDC addresses on Ethereum
    const usdcAddresses = await getAssets(1, "USDC")
    
    if (usdcAddresses.length === 0) {
      return {
        totalMarkets: 0,
        totalTVL: 0,
      }
    }
    
    // Then fetch markets with those addresses
    const data = await graphQLClient.request<MarketsResponse>(GET_MARKETS_QUERY, {
      first: 200,
      skip: 0,
      chainId_in: [1], // Ethereum
      loanAssetAddress_in: usdcAddresses,
      orderBy: "SupplyAssetsUsd",
      orderDirection: "Desc",
    })
    
    // Calculate total TVL
    const totalTVL = data.markets.items.reduce(
      (sum, market) => sum + (market.state?.supplyAssetsUsd || 0),
      0
    )
    
    return {
      totalMarkets: data.markets.pageInfo?.countTotal || data.markets.items.length,
      totalTVL,
    }
  } catch (error) {
    console.error("Failed to fetch Ethereum USDC stats:", error)
    return {
      totalMarkets: 0,
      totalTVL: 0,
    }
  }
}

export default async function Home() {
  const ethereumUSDCStats = await getEthereumUSDCStats()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Morpho Markets</h1>
        <p className="text-muted-foreground">
          Browse and analyze lending markets across different chains and assets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          <MarketFilterCard
            chain="ethereum"
            chainLabel="Ethereum"
            loanAsset="USDC"
            totalMarkets={ethereumUSDCStats.totalMarkets}
            totalTVL={ethereumUSDCStats.totalTVL}
          />
        </Suspense>
      </div>
    </div>
  )
}
