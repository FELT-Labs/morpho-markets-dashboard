import { graphQLClient } from '@/lib/graphql/client'
import { LiquidityMetrics, LiquidityHistoricalData, TimeRange, PublicAllocatorLiquidity } from '@/types/market'

const GET_LIQUIDITY_METRICS_QUERY = `
  query GetLiquidityMetrics($uniqueKey: String!, $chainId: Int!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      reallocatableLiquidityAssets
      targetBorrowUtilization
      targetWithdrawUtilization
      state {
        liquidityAssets
        liquidityAssetsUsd
        supplyAssets
        supplyAssetsUsd
        borrowAssets
        borrowAssetsUsd
        collateralAssets
        collateralAssetsUsd
        utilization
      }
      publicAllocatorSharedLiquidity {
        id
        assets
        supplyMarket {
          uniqueKey
        }
        withdrawMarket {
          uniqueKey
          loanAsset {
            symbol
          }
          collateralAsset {
            symbol
          }
        }
      }
    }
  }
`

const GET_LIQUIDITY_HISTORICAL_QUERY = `
  query GetLiquidityHistorical($uniqueKey: String!, $chainId: Int!, $options: TimeseriesOptions!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      historicalState {
        liquidityAssetsUsd(options: $options) { x y }
        supplyAssetsUsd(options: $options) { x y }
        borrowAssetsUsd(options: $options) { x y }
        utilization(options: $options) { x y }
      }
    }
  }
`

interface LiquidityMetricsResponse {
  reallocatableLiquidityAssets?: string
  targetBorrowUtilization: string
  targetWithdrawUtilization: string
  state: {
    liquidityAssets: string
    liquidityAssetsUsd?: number
    supplyAssets: string
    supplyAssetsUsd?: number
    borrowAssets: string
    borrowAssetsUsd?: number
    collateralAssets?: string
    collateralAssetsUsd?: number
    utilization: number
  }
  publicAllocatorSharedLiquidity?: PublicAllocatorLiquidity[]
}

export async function getLiquidityMetrics(
  uniqueKey: string,
  chainId: number
): Promise<{ metrics: LiquidityMetrics; publicAllocator: PublicAllocatorLiquidity[] }> {
  try {
    const data = await graphQLClient.request<{
      marketByUniqueKey: LiquidityMetricsResponse
    }>(GET_LIQUIDITY_METRICS_QUERY, {
      uniqueKey,
      chainId,
    })

    const market = data.marketByUniqueKey

    return {
      metrics: {
        liquidityAssets: market.state.liquidityAssets,
        liquidityAssetsUsd: market.state.liquidityAssetsUsd,
        reallocatableLiquidityAssets: market.reallocatableLiquidityAssets,
        supplyAssets: market.state.supplyAssets,
        supplyAssetsUsd: market.state.supplyAssetsUsd,
        borrowAssets: market.state.borrowAssets,
        borrowAssetsUsd: market.state.borrowAssetsUsd,
        collateralAssets: market.state.collateralAssets,
        collateralAssetsUsd: market.state.collateralAssetsUsd,
        utilization: market.state.utilization,
        targetBorrowUtilization: market.targetBorrowUtilization,
        targetWithdrawUtilization: market.targetWithdrawUtilization,
      },
      publicAllocator: market.publicAllocatorSharedLiquidity || [],
    }
  } catch (error) {
    console.error('Error fetching liquidity metrics:', error)
    throw error
  }
}

export async function getLiquidityHistoricalData(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<LiquidityHistoricalData> {
  try {
    // Calculate timestamps
    const endTimestamp = Math.floor(Date.now() / 1000)
    const startTimestamp = endTimestamp - timeRange * 24 * 60 * 60

    // Set interval based on time range
    const interval = timeRange <= 90 ? 'DAY' : 'WEEK'

    const data = await graphQLClient.request<{
      marketByUniqueKey: { historicalState: LiquidityHistoricalData }
    }>(GET_LIQUIDITY_HISTORICAL_QUERY, {
      uniqueKey,
      chainId,
      options: {
        startTimestamp,
        endTimestamp,
        interval,
      },
    })

    return data.marketByUniqueKey.historicalState
  } catch (error) {
    console.error('Error fetching liquidity historical data:', error)
    throw error
  }
}
