import { graphQLClient } from '@/lib/graphql/client'
import { CollateralPriceData, TimeRange } from '@/types/market'

const GET_COLLATERAL_PRICE_DATA_QUERY = `
  query GetCollateralPriceData($uniqueKey: String!, $chainId: Int!, $startTimestamp: Int!, $interval: TimeseriesInterval!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      collateralAsset {
        symbol
        name
        priceUsd
        oraclePriceUsd
        historicalPriceUsd(options: { 
          startTimestamp: $startTimestamp
          interval: $interval
        }) {
          x
          y
        }
      }
      state {
        price
        dailyPriceVariation
      }
    }
  }
`

function getIntervalForTimeRange(timeRange: TimeRange): string {
  switch (timeRange) {
    case 7:
      return 'HOUR'
    case 30:
      return 'DAY'
    case 90:
      return 'DAY'
    case 365:
      return 'WEEK'
    default:
      return 'DAY'
  }
}

function getStartTimestamp(timeRange: TimeRange): number {
  const now = Math.floor(Date.now() / 1000) // Current timestamp in seconds
  const daysInSeconds = timeRange * 24 * 60 * 60
  return now - daysInSeconds
}

interface GraphQLResponse {
  marketByUniqueKey: {
    collateralAsset: {
      symbol: string
      name: string
      priceUsd?: number
      oraclePriceUsd?: number
      historicalPriceUsd: Array<{ x: number; y: number }>
    } | null
    state: {
      price?: string
      dailyPriceVariation?: number
    }
  }
}

export async function getCollateralPriceData(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<CollateralPriceData | null> {
  try {
    const startTimestamp = getStartTimestamp(timeRange)
    const interval = getIntervalForTimeRange(timeRange)

    const data = await graphQLClient.request<GraphQLResponse>(
      GET_COLLATERAL_PRICE_DATA_QUERY,
      {
        uniqueKey,
        chainId,
        startTimestamp,
        interval
      }
    )

    const { collateralAsset, state } = data.marketByUniqueKey

    if (!collateralAsset) {
      return null
    }

    return {
      symbol: collateralAsset.symbol,
      name: collateralAsset.name,
      currentPrice: collateralAsset.priceUsd,
      oraclePrice: collateralAsset.oraclePriceUsd,
      dailyPriceVariation: state.dailyPriceVariation,
      historicalPrices: collateralAsset.historicalPriceUsd || []
    }
  } catch (error) {
    console.error('Error fetching collateral price data:', error)
    throw error
  }
}
