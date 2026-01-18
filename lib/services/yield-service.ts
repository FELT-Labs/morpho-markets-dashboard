import { graphQLClient } from '@/lib/graphql/client'
import { YieldMetrics, YieldHistoricalData, TimeRange } from '@/types/market'

const GET_YIELD_METRICS_QUERY = `
  query GetYieldMetrics($uniqueKey: String!, $chainId: Int!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      state {
        supplyApy
        netSupplyApy
        borrowApy
        netBorrowApy
        apyAtTarget
        utilization
        fee
        avgSupplyApy
        avgNetSupplyApy
        avgBorrowApy
        avgNetBorrowApy
        dailySupplyApy
        dailyNetSupplyApy
        dailyBorrowApy
        dailyNetBorrowApy
        weeklySupplyApy
        weeklyNetSupplyApy
        weeklyBorrowApy
        weeklyNetBorrowApy
        monthlySupplyApy
        monthlyNetSupplyApy
        monthlyBorrowApy
        monthlyNetBorrowApy
        yearlySupplyApy
        yearlyNetSupplyApy
        yearlyBorrowApy
        yearlyNetBorrowApy
      }
    }
  }
`

const GET_YIELD_HISTORICAL_QUERY = `
  query GetYieldHistorical($uniqueKey: String!, $chainId: Int!, $options: TimeseriesOptions!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      historicalState {
        supplyApy(options: $options) { x y }
        netSupplyApy(options: $options) { x y }
        borrowApy(options: $options) { x y }
        netBorrowApy(options: $options) { x y }
        apyAtTarget(options: $options) { x y }
      }
    }
  }
`

export async function getYieldMetrics(
  uniqueKey: string,
  chainId: number
): Promise<YieldMetrics> {
  try {
    const data = await graphQLClient.request<{
      marketByUniqueKey: { state: YieldMetrics }
    }>(GET_YIELD_METRICS_QUERY, {
      uniqueKey,
      chainId,
    })

    return data.marketByUniqueKey.state
  } catch (error) {
    console.error('Error fetching yield metrics:', error)
    throw error
  }
}

export async function getYieldHistoricalData(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<YieldHistoricalData> {
  try {
    // Calculate timestamps
    const endTimestamp = Math.floor(Date.now() / 1000)
    const startTimestamp = endTimestamp - timeRange * 24 * 60 * 60

    // Set interval based on time range
    const interval = timeRange <= 90 ? 'DAY' : 'WEEK'

    const data = await graphQLClient.request<{
      marketByUniqueKey: { historicalState: YieldHistoricalData }
    }>(GET_YIELD_HISTORICAL_QUERY, {
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
    console.error('Error fetching yield historical data:', error)
    throw error
  }
}
