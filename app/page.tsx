/**
 * Home page - refactored to use service layer
 */

import { Suspense } from "react"
import { MarketFilterCard } from "@/components/markets/market-filter-card"
import { fetchAssetAddresses } from "@/lib/services/asset-service"
import { fetchMarkets, calculateTotalTVL } from "@/lib/services/market-service"
import { CHAIN_CONFIG } from "@/lib/constants/query-config"

async function getEthereumUSDCStats() {
  try {
    // First, get all USDC addresses on Ethereum
    const usdcAddresses = await fetchAssetAddresses(CHAIN_CONFIG.ETHEREUM.id, "USDC")
    
    if (usdcAddresses.length === 0) {
      return {
        totalMarkets: 0,
        totalTVL: 0,
      }
    }
    
    // Then fetch markets with those addresses
    const { markets, pageInfo } = await fetchMarkets({
      chainId: CHAIN_CONFIG.ETHEREUM.id,
      loanAssetAddresses: usdcAddresses,
    })
    
    return {
      totalMarkets: pageInfo?.countTotal || markets.length,
      totalTVL: calculateTotalTVL(markets),
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
            chain={CHAIN_CONFIG.ETHEREUM.name}
            chainLabel={CHAIN_CONFIG.ETHEREUM.label}
            loanAsset="USDC"
            totalMarkets={ethereumUSDCStats.totalMarkets}
            totalTVL={ethereumUSDCStats.totalTVL}
          />
        </Suspense>
      </div>
    </div>
  )
}
