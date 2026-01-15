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
