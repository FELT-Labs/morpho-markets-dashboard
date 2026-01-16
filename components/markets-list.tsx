'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getMarkets, MarketsResponse } from '@/lib/services/market-service'
import { MarketOrderBy, OrderDirection } from '@/types/market'
import { MarketsTable } from '@/components/markets-table'
import { MarketControls } from '@/components/market-controls'
import { VaultSelector } from '@/components/vault-selector'
import { VaultMarketExposure } from '@/lib/services/vault-service'
import { Loader2 } from 'lucide-react'

interface MarketsListProps {
  chain: string
  loanAsset: string
}

export function MarketsList({ chain, loanAsset }: MarketsListProps) {
  const searchParams = useSearchParams()
  const [data, setData] = useState<MarketsResponse | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketToVaults, setMarketToVaults] = useState<Map<string, VaultMarketExposure[]>>(new Map())

  useEffect(() => {
    const fetchMarkets = async () => {
      // Show different loading states for initial vs. subsequent loads
      if (data === null) {
        setIsInitialLoad(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      
      try {
        const orderBy = (searchParams.get('orderBy') as MarketOrderBy) || 'SupplyAssetsUsd'
        const orderDirection = (searchParams.get('orderDirection') as OrderDirection) || 'Desc'
        const limit = Number(searchParams.get('limit')) || 100
        const minSupplyUsd = searchParams.get('minSupply') 
          ? Number(searchParams.get('minSupply')) 
          : undefined

        const result = await getMarkets(
          chain,
          loanAsset,
          orderBy,
          orderDirection,
          limit,
          minSupplyUsd
        )
        
        setData(result)
      } catch (err) {
        console.error('Error fetching markets:', err)
        setError('Failed to load markets. Please try again.')
      } finally {
        setIsInitialLoad(false)
        setIsRefreshing(false)
      }
    }

    fetchMarkets()
  }, [chain, loanAsset, searchParams])

  // Initial loading state - show skeleton
  if (isInitialLoad && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {chain.charAt(0).toUpperCase() + chain.slice(1)} Markets
          </h1>
          <p className="text-muted-foreground">
            Loading {loanAsset.toUpperCase()} loan asset markets...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {chain.charAt(0).toUpperCase() + chain.slice(1)} Markets
          </h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Subtle loading indicator at the top */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 animate-pulse z-50" />
      )}
      
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            {chain.charAt(0).toUpperCase() + chain.slice(1)} Markets
          </h1>
          {isRefreshing && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Showing {data.count} of {data.total} {loanAsset.toUpperCase()} loan asset markets
        </p>
      </div>
      
      <VaultSelector 
        chain={chain} 
        loanAsset={loanAsset} 
        onVaultMarketsChange={setMarketToVaults}
      />
      
      <MarketControls chain={chain} loanAsset={loanAsset} />
      
      {/* Add opacity transition during refresh */}
      <div className={isRefreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <MarketsTable 
          markets={data.items} 
          chain={chain} 
          loanAsset={loanAsset}
          marketToVaults={marketToVaults}
        />
      </div>
      
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
