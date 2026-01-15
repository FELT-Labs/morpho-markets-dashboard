'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getMarkets, MarketsResponse } from '@/lib/services/market-service'
import { MarketOrderBy, OrderDirection } from '@/types/market'
import { MarketsTable } from '@/components/markets-table'
import { MarketControls } from '@/components/market-controls'

interface MarketsListProps {
  chain: string
  loanAsset: string
}

export function MarketsList({ chain, loanAsset }: MarketsListProps) {
  const searchParams = useSearchParams()
  const [data, setData] = useState<MarketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true)
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
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [chain, loanAsset, searchParams])

  if (loading) {
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
          <div className="text-muted-foreground">Loading markets...</div>
        </div>
      </div>
    )
  }

  if (error) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {chain.charAt(0).toUpperCase() + chain.slice(1)} Markets
        </h1>
        <p className="text-muted-foreground">
          Showing {data.count} of {data.total} {loanAsset.toUpperCase()} loan asset markets
        </p>
      </div>
      
      <MarketControls chain={chain} loanAsset={loanAsset} />
      
      <MarketsTable markets={data.items} chain={chain} loanAsset={loanAsset} />
    </div>
  )
}
