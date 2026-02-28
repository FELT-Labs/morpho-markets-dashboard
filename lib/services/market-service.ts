import { graphQLClient } from '@/lib/graphql/client'
import { Market, MarketOrderBy, OrderDirection } from '@/types/market'

const USDC_ADDRESSES = {
  ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
}

const GET_MARKETS_QUERY = `
  query GetMarkets(
    $chainId: [Int!]!
    $loanAssetAddress: [String!]!
    $orderBy: MarketOrderBy!
    $orderDirection: OrderDirection!
    $first: Int!
    $minSupplyUsd: Float
  ) {
    markets(
      where: { 
        chainId_in: $chainId
        loanAssetAddress_in: $loanAssetAddress
        listed: true
        supplyAssetsUsd_gte: $minSupplyUsd
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
    ) {
      items {
        uniqueKey
        lltv
        loanAsset {
          symbol
          name
          address
          decimals
          priceUsd
        }
        collateralAsset {
          symbol
          name
          address
          decimals
          priceUsd
        }
        state {
          supplyAssets
          supplyAssetsUsd
          borrowAssets
          borrowAssetsUsd
          utilization
          supplyApy
          borrowApy
          netSupplyApy
          netBorrowApy
        }
      }
      pageInfo {
        countTotal
        count
      }
    }
  }
`

const GET_MARKET_BY_KEY_QUERY = `
  query GetMarketByKey($uniqueKey: String!, $chainId: Int!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      uniqueKey
      lltv
      loanAsset {
        symbol
        name
        address
        decimals
        priceUsd
      }
      collateralAsset {
        symbol
        name
        address
        decimals
        priceUsd
      }
      state {
        supplyAssets
        supplyAssetsUsd
        borrowAssets
        borrowAssetsUsd
        utilization
        supplyApy
        borrowApy
        netSupplyApy
        netBorrowApy
      }
    }
  }
`

const GET_MARKETS_WITH_HISTORY_QUERY = `
  query GetMarketsWithHistoryV3(
    $uniqueKeys: [String!]!
    $chainId: [Int!]!
    $startTimestamp: Int!
    $endTimestamp: Int!
    $interval: TimeseriesInterval!
    $first: Int!
  ) {
    markets(
      where: { 
        uniqueKey_in: $uniqueKeys
        chainId_in: $chainId
      }
      first: $first
    ) {
      items {
        uniqueKey
        historicalState {
          netSupplyApy(options: { 
            startTimestamp: $startTimestamp
            endTimestamp: $endTimestamp
            interval: $interval
          }) {
            x
            y
          }
        }
      }
    }
  }
`

export interface MarketHistoryData extends Market {
  historicalState: {
    netSupplyApy: { x: number; y: number }[]
  }
}

export async function getMarketsWithHistory(
  chain: string = 'ethereum',
  loanAsset: string = 'usdc',
  limit: number = 100,
  minSupplyUsd: number = 100000,
  historyDays: number = 7
): Promise<MarketHistoryData[]> {
  const chainId = chain === 'ethereum' ? 1 : 1
  // First, get the top markets by supply using the standard query
  const marketsResponse = await getMarkets(
    chain,
    loanAsset,
    'SupplyAssetsUsd',
    'Desc',
    limit,
    minSupplyUsd
  )

  const markets = marketsResponse.items
  if (!markets || markets.length === 0) return []

  const uniqueKeys = markets.map(m => m.uniqueKey)
  
  const endTimestamp = Math.floor(Date.now() / 1000)
  const startTimestamp = endTimestamp - historyDays * 24 * 60 * 60

  // Batch the history requests
  // We query history specifically for the markets we found above
  const batchSize = 25
  const historyResults: Map<string, { x: number; y: number }[]> = new Map()

  for (let i = 0; i < uniqueKeys.length; i += batchSize) {
    const keysBatch = uniqueKeys.slice(i, i + batchSize)
    
    try {
      const data = await graphQLClient.request<{ 
        markets: { 
          items: {
            uniqueKey: string
            historicalState: {
              netSupplyApy: { x: number; y: number }[]
            }
          }[]
        }
      }>(GET_MARKETS_WITH_HISTORY_QUERY, {
        uniqueKeys: keysBatch,
        chainId: [chainId],
        startTimestamp,
        endTimestamp,
        interval: 'DAY',
        first: keysBatch.length
      })

      if (data.markets?.items) {
        data.markets.items.forEach(item => {
          if (item.historicalState?.netSupplyApy) {
            historyResults.set(item.uniqueKey, item.historicalState.netSupplyApy)
          }
        })
      }
    } catch (error) {
      console.error(`Error fetching history for batch ${i}:`, error)
      // Continue with other batches, don't fail completely
    }
  }

  // Merge history with market data
  return markets.map(m => ({
    ...m,
    historicalState: {
      netSupplyApy: historyResults.get(m.uniqueKey) || []
    }
  }))
}

export interface MarketsResponse {
  items: Market[]
  total: number
  count: number
}

export async function getMarkets(
  chain: string = 'ethereum',
  loanAsset: string = 'usdc',
  orderBy: MarketOrderBy = 'SupplyAssetsUsd',
  orderDirection: OrderDirection = 'Desc',
  limit: number = 100,
  minSupplyUsd?: number
): Promise<MarketsResponse> {
  try {
    const chainId = chain === 'ethereum' ? 1 : 1
    const loanAssetAddress = USDC_ADDRESSES[chain as keyof typeof USDC_ADDRESSES] || USDC_ADDRESSES.ethereum

    const data = await graphQLClient.request<{ 
      markets: { 
        items: Market[]
        pageInfo: { countTotal: number; count: number }
      } 
    }>(
      GET_MARKETS_QUERY,
      {
        chainId: [chainId],
        loanAssetAddress: [loanAssetAddress],
        orderBy,
        orderDirection,
        first: limit,
        minSupplyUsd: minSupplyUsd || null
      }
    )

    return {
      items: data.markets.items,
      total: data.markets.pageInfo.countTotal,
      count: data.markets.pageInfo.count
    }
  } catch (error) {
    console.error('Error fetching markets:', error)
    throw error
  }
}

export async function getMarketByKey(uniqueKey: string, chain: string = 'ethereum'): Promise<Market> {
  try {
    const chainId = chain === 'ethereum' ? 1 : 1

    const data = await graphQLClient.request<{ marketByUniqueKey: Market }>(
      GET_MARKET_BY_KEY_QUERY,
      {
        uniqueKey,
        chainId
      }
    )

    return data.marketByUniqueKey
  } catch (error) {
    console.error('Error fetching market:', error)
    throw error
  }
}
