export interface Asset {
  symbol: string
  name: string
  address: string
  decimals: number
  priceUsd?: number
  oraclePriceUsd?: number
}

export interface MarketState {
  supplyAssets: string
  supplyAssetsUsd?: number
  borrowAssets: string
  borrowAssetsUsd?: number
  utilization: number
  supplyApy: number
  borrowApy: number
  netSupplyApy?: number
  netBorrowApy?: number
  price?: string
  dailyPriceVariation?: number
}

export interface Market {
  uniqueKey: string
  lltv: string
  loanAsset: Asset
  collateralAsset: Asset | null
  state: MarketState
}

export type MarketOrderBy = 
  | 'CollateralAssetSymbol'
  | 'SupplyAssetsUsd'
  | 'BorrowAssetsUsd'
  | 'Utilization'
  | 'SupplyApy'

export type OrderDirection = 'Asc' | 'Desc'

export interface MarketFilters {
  orderBy: MarketOrderBy
  orderDirection: OrderDirection
  limit: number
  minSupplyUsd?: number
}

export interface PriceDataPoint {
  x: number // timestamp
  y: number // price value
}

export type TimeRange = 7 | 30 | 90 | 365

export interface CollateralPriceData {
  symbol: string
  name: string
  currentPrice?: number
  oraclePrice?: number
  dailyPriceVariation?: number
  historicalPrices: PriceDataPoint[]
}

export interface CollateralAtRiskDataPoint {
  collateralPriceRatio: number
  collateralAssets: string
  collateralUsd: number
}

export interface CollateralRiskData {
  lltv: string
  collateralDecimals: number
  collateralAssets: string
  collateralAssetsUsd?: number
  borrowAssets: string
  borrowAssetsUsd?: number
  collateralAtRisk: CollateralAtRiskDataPoint[]
}

export interface YieldMetrics {
  // Current instantaneous rates
  supplyApy: number
  netSupplyApy?: number
  borrowApy: number
  netBorrowApy?: number
  apyAtTarget: number
  utilization: number
  fee: number
  
  // Time-averaged rates
  avgSupplyApy?: number
  avgNetSupplyApy?: number
  avgBorrowApy?: number
  avgNetBorrowApy?: number
  
  dailySupplyApy?: number
  dailyNetSupplyApy?: number
  dailyBorrowApy?: number
  dailyNetBorrowApy?: number
  
  weeklySupplyApy?: number
  weeklyNetSupplyApy?: number
  weeklyBorrowApy?: number
  weeklyNetBorrowApy?: number
  
  monthlySupplyApy?: number
  monthlyNetSupplyApy?: number
  monthlyBorrowApy?: number
  monthlyNetBorrowApy?: number
  
  yearlySupplyApy?: number
  yearlyNetSupplyApy?: number
  yearlyBorrowApy?: number
  yearlyNetBorrowApy?: number
}

export interface YieldHistoricalDataPoint {
  x: number // timestamp
  y: number // value
}

export interface YieldHistoricalData {
  supplyApy: YieldHistoricalDataPoint[]
  netSupplyApy: YieldHistoricalDataPoint[]
  borrowApy: YieldHistoricalDataPoint[]
  netBorrowApy: YieldHistoricalDataPoint[]
  apyAtTarget: YieldHistoricalDataPoint[]
}

export type YieldMetricType = 
  | 'supplyApy'
  | 'netSupplyApy'
  | 'borrowApy'
  | 'netBorrowApy'
  | 'apyAtTarget'

export interface LiquidityMetrics {
  // Current state
  liquidityAssets: string
  liquidityAssetsUsd?: number
  reallocatableLiquidityAssets?: string
  supplyAssets: string
  supplyAssetsUsd?: number
  borrowAssets: string
  borrowAssetsUsd?: number
  collateralAssets?: string
  collateralAssetsUsd?: number
  utilization: number
  
  // Target metrics
  targetBorrowUtilization: string
  targetWithdrawUtilization: string
}

export interface PublicAllocatorLiquidity {
  id: string
  assets: string
  supplyMarket: {
    uniqueKey: string
  }
  withdrawMarket: {
    uniqueKey: string
    loanAsset: {
      symbol: string
    }
    collateralAsset: {
      symbol: string
    } | null
  }
}

export interface LiquidityHistoricalDataPoint {
  x: number // timestamp
  y: number // value
}

export interface LiquidityHistoricalData {
  liquidityAssetsUsd: LiquidityHistoricalDataPoint[]
  supplyAssetsUsd: LiquidityHistoricalDataPoint[]
  borrowAssetsUsd: LiquidityHistoricalDataPoint[]
  utilization: LiquidityHistoricalDataPoint[]
}

export type LiquidityMetricType = 
  | 'liquidityAssetsUsd'
  | 'supplyAssetsUsd'
  | 'borrowAssetsUsd'
  | 'utilization'

// Activity tab types

export type TransactionType = 
  | 'MarketSupply'
  | 'MarketBorrow'
  | 'MarketRepay'
  | 'MarketWithdraw'
  | 'MarketSupplyCollateral'
  | 'MarketWithdrawCollateral'
  | 'MarketLiquidation'

export interface ActivityMetrics {
  totalTransactions: number
  totalVolumeUsd: number
  activeUsers: number
  liquidationCount: number
  avgTransactionSize: number
  transactionTypeDistribution: Record<TransactionType, number>
}

export interface ActivityVolumeData {
  timestamp: number
  supplyLoanVolume: number
  supplyCollateralVolume: number
  borrowVolume: number
  repayVolume: number
  withdrawLoanVolume: number
  withdrawCollateralVolume: number
  liquidationVolume: number
}

export interface LiquidationEvent {
  timestamp: number
  hash: string
  userAddress: string
  liquidatorAddress: string
  repaidAssetsUsd: number
  seizedAssetsUsd: number
  badDebtAssetsUsd: number
}
