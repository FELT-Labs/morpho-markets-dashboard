export interface Asset {
  symbol: string
  name: string
  address: string
  decimals: number
  priceUsd?: number
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
