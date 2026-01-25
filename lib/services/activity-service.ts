import { graphQLClient } from '@/lib/graphql/client'
import {
  ActivityMetrics,
  ActivityVolumeData,
  TimeRange,
  TransactionType,
} from '@/types/market'

const GET_MARKET_TRANSACTIONS_QUERY = `
  query GetMarketTransactions(
    $marketUniqueKey: String!
    $chainId: Int!
    $first: Int!
    $skip: Int!
    $timestampGte: Int
  ) {
    transactions(
      first: $first
      skip: $skip
      orderBy: Timestamp
      orderDirection: Desc
      where: {
        marketUniqueKey_in: [$marketUniqueKey]
        chainId_in: [$chainId]
        timestamp_gte: $timestampGte
        type_in: [
          MarketSupply
          MarketBorrow
          MarketRepay
          MarketWithdraw
          MarketSupplyCollateral
          MarketWithdrawCollateral
          MarketLiquidation
        ]
      }
    ) {
      items {
        timestamp
        hash
        type
        user {
          address
        }
        data {
          ... on MarketTransferTransactionData {
            assetsUsd
          }
          ... on MarketCollateralTransferTransactionData {
            assetsUsd
          }
          ... on MarketLiquidationTransactionData {
            repaidAssetsUsd
            seizedAssetsUsd
            badDebtAssetsUsd
            liquidator
          }
        }
      }
      pageInfo {
        count
      }
    }
  }
`

interface RawTransaction {
  timestamp: string
  hash: string
  type: TransactionType
  user: {
    address: string
  }
  data: {
    assetsUsd?: number
    repaidAssetsUsd?: number
    seizedAssetsUsd?: number
    badDebtAssetsUsd?: number
    liquidator?: string
  }
}

interface TransactionsResponse {
  transactions: {
    items: RawTransaction[]
    pageInfo: {
      count: number
    }
  }
}

interface ActivityData {
  metrics: ActivityMetrics
  volumeData: ActivityVolumeData[]
}

/**
 * Fetch all activity data for a market in a single optimized call
 * This fetches transactions once and processes them for all visualizations
 */
export async function getActivityData(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<ActivityData> {
  const endTimestamp = Math.floor(Date.now() / 1000)
  const startTimestamp = endTimestamp - timeRange * 24 * 60 * 60

  // Fetch all transactions with pagination (using maximum page size of 1000)
  const allTransactions: RawTransaction[] = []
  let skip = 0
  const first = 1000 // Maximum allowed by GraphQL API
  let hasMore = true

  while (hasMore) {
    try {
      const data = await graphQLClient.request<TransactionsResponse>(
        GET_MARKET_TRANSACTIONS_QUERY,
        {
          marketUniqueKey: uniqueKey,
          chainId,
          first,
          skip,
          timestampGte: startTimestamp,
        }
      )

      const items = data.transactions.items
      allTransactions.push(...items)

      hasMore = items.length === first
      skip += first

      // Safety limit - most markets won't have this many transactions in 7-90 days
      if (skip >= 100000) {
        console.warn('Reached transaction fetch limit of 100000')
        break
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      break
    }
  }

  // Process all data in a single pass
  return processActivityData(allTransactions)
}

/**
 * Process raw transactions into all required formats
 */
function processActivityData(transactions: RawTransaction[]): ActivityData {
  // Initialize data structures
  const uniqueUsers = new Set<string>()
  let totalVolumeUsd = 0
  let liquidationCount = 0
  const typeDistribution: Record<TransactionType, number> = {
    MarketSupply: 0,
    MarketBorrow: 0,
    MarketRepay: 0,
    MarketWithdraw: 0,
    MarketSupplyCollateral: 0,
    MarketWithdrawCollateral: 0,
    MarketLiquidation: 0,
  }

  const dailyVolumes = new Map<
    number,
    {
      supplyLoanVolume: number
      supplyCollateralVolume: number
      borrowVolume: number
      repayVolume: number
      withdrawLoanVolume: number
      withdrawCollateralVolume: number
      liquidationVolume: number
    }
  >()

  const bucketSize = 24 * 3600 // 1 day in seconds

  // Single pass through all transactions
  transactions.forEach((tx) => {
    const timestamp = parseInt(tx.timestamp)
    
    // Metrics calculation
    uniqueUsers.add(tx.user.address)
    typeDistribution[tx.type]++

    const volumeUsd =
      tx.type === 'MarketLiquidation'
        ? tx.data.repaidAssetsUsd || 0
        : tx.data.assetsUsd || 0

    totalVolumeUsd += volumeUsd

    // Count liquidations for metrics
    if (tx.type === 'MarketLiquidation') {
      liquidationCount++
    }

    // Volume data aggregation by day
    const bucketTimestamp = Math.floor(timestamp / bucketSize) * bucketSize
    const existing = dailyVolumes.get(bucketTimestamp) || {
      supplyLoanVolume: 0,
      supplyCollateralVolume: 0,
      borrowVolume: 0,
      repayVolume: 0,
      withdrawLoanVolume: 0,
      withdrawCollateralVolume: 0,
      liquidationVolume: 0,
    }

    switch (tx.type) {
      case 'MarketSupply':
        existing.supplyLoanVolume += volumeUsd
        break
      case 'MarketSupplyCollateral':
        existing.supplyCollateralVolume += volumeUsd
        break
      case 'MarketBorrow':
        existing.borrowVolume += volumeUsd
        break
      case 'MarketRepay':
        existing.repayVolume += volumeUsd
        break
      case 'MarketWithdraw':
        existing.withdrawLoanVolume += volumeUsd
        break
      case 'MarketWithdrawCollateral':
        existing.withdrawCollateralVolume += volumeUsd
        break
      case 'MarketLiquidation':
        existing.liquidationVolume += volumeUsd
        break
    }

    dailyVolumes.set(bucketTimestamp, existing)
  })

  // Prepare final data
  const avgTransactionSize =
    transactions.length > 0 ? totalVolumeUsd / transactions.length : 0

  const metrics: ActivityMetrics = {
    totalTransactions: transactions.length,
    totalVolumeUsd,
    activeUsers: uniqueUsers.size,
    liquidationCount,
    avgTransactionSize,
    transactionTypeDistribution: typeDistribution,
  }

  const volumeData: ActivityVolumeData[] = Array.from(dailyVolumes.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      ...data,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return {
    metrics,
    volumeData,
  }
}

// Legacy functions for backward compatibility (now just call getActivityData)
export async function getActivityMetrics(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<ActivityMetrics> {
  const data = await getActivityData(uniqueKey, chainId, timeRange)
  return data.metrics
}

export async function getActivityVolumeData(
  uniqueKey: string,
  chainId: number,
  timeRange: TimeRange
): Promise<ActivityVolumeData[]> {
  const data = await getActivityData(uniqueKey, chainId, timeRange)
  return data.volumeData
}
