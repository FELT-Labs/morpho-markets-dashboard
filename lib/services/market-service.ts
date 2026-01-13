/**
 * Market-related data fetching service
 */

import { graphQLClient } from '@/lib/graphql/client'
import { GET_MARKETS_QUERY, GET_MARKET_BY_UNIQUE_KEY_QUERY } from '@/lib/graphql/queries'
import { QUERY_DEFAULTS } from '@/lib/constants/query-config'
import { MarketsResponse, MarketResponse, Market, PageInfo } from '@/types'

export interface FetchMarketsParams {
  chainId: number
  loanAssetAddresses?: string[]
  first?: number
  skip?: number
  orderBy?: string
  orderDirection?: string
}

export interface MarketsResult {
  markets: Market[]
  pageInfo?: PageInfo
}

/**
 * Fetch markets with optional filters
 */
export async function fetchMarkets(params: FetchMarketsParams): Promise<MarketsResult> {
  const {
    chainId,
    loanAssetAddresses,
    first = QUERY_DEFAULTS.MARKETS_PAGE_SIZE,
    skip = 0,
    orderBy = QUERY_DEFAULTS.DEFAULT_ORDER_BY,
    orderDirection = QUERY_DEFAULTS.DEFAULT_ORDER_DIRECTION,
  } = params

  try {
    const data = await graphQLClient.request<MarketsResponse>(GET_MARKETS_QUERY, {
      first,
      skip,
      chainId_in: [chainId],
      loanAssetAddress_in: loanAssetAddresses,
      orderBy,
      orderDirection,
    })
    
    return {
      markets: data.markets.items,
      pageInfo: data.markets.pageInfo,
    }
  } catch (error) {
    console.error('Failed to fetch markets:', error)
    return {
      markets: [],
      pageInfo: undefined,
    }
  }
}

/**
 * Fetch a single market by unique key
 */
export async function fetchMarketByUniqueKey(
  uniqueKey: string,
  chainId: number
): Promise<Market | null> {
  try {
    const data = await graphQLClient.request<MarketResponse>(
      GET_MARKET_BY_UNIQUE_KEY_QUERY,
      {
        uniqueKey,
        chainId,
      }
    )
    return data.marketByUniqueKey
  } catch (error) {
    console.error('Failed to fetch market:', error)
    return null
  }
}

/**
 * Calculate total TVL from markets
 */
export function calculateTotalTVL(markets: Market[]): number {
  return markets.reduce(
    (sum, market) => sum + (market.state?.supplyAssetsUsd || 0),
    0
  )
}

/**
 * Get market statistics
 */
export interface MarketStatistics {
  totalMarkets: number
  totalTVL: number
  totalBorrowed: number
  averageUtilization: number
}

export function calculateMarketStatistics(markets: Market[]): MarketStatistics {
  const totalMarkets = markets.length
  const totalTVL = calculateTotalTVL(markets)
  
  const totalBorrowed = markets.reduce(
    (sum, market) => sum + (market.state?.borrowAssetsUsd || 0),
    0
  )
  
  const utilizationSum = markets.reduce(
    (sum, market) => sum + (market.state?.utilization || 0),
    0
  )
  const averageUtilization = totalMarkets > 0 ? utilizationSum / totalMarkets : 0
  
  return {
    totalMarkets,
    totalTVL,
    totalBorrowed,
    averageUtilization,
  }
}
