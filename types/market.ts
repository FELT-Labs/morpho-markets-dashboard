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
