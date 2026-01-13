export interface Market {
  id: string
  uniqueKey: string
  loanAsset: Asset
  collateralAsset: Asset | null
  state: MarketState | null
  morphoBlue: MorphoBlue
  lltv: string
  irmAddress: string
  creationTimestamp: string
  creationBlockNumber: number
  listed: boolean
  oracle?: Oracle | null
  supplyingVaults?: Vault[]
  badDebt?: MarketBadDebt | null
  realizedBadDebt?: MarketBadDebt | null
  warnings?: MarketWarning[]
  targetBorrowUtilization: string
  targetWithdrawUtilization: string
}

export interface MorphoBlue {
  chain: Chain
}

export interface Asset {
  id: string
  symbol: string
  address: string
  name: string
  decimals: number
  logoURI?: string | null
  priceUsd?: number | null
}

export interface MarketState {
  id: string
  supplyAssets: string
  borrowAssets: string
  supplyAssetsUsd?: number | null
  borrowAssetsUsd?: number | null
  supplyApy?: number | null
  borrowApy?: number | null
  netSupplyApy?: number | null
  netBorrowApy?: number | null
  utilization: number
  liquidityAssets: string
  liquidityAssetsUsd?: number | null
  collateralAssets?: string | null
  collateralAssetsUsd?: number | null
  fee: number
  timestamp: string
  supplyShares: string
  borrowShares: string
  rewards?: MarketStateReward[]
  avgSupplyApy?: number | null
  avgBorrowApy?: number | null
  avgNetSupplyApy?: number | null
  avgNetBorrowApy?: number | null
  dailySupplyApy?: number | null
  dailyBorrowApy?: number | null
  weeklySupplyApy?: number | null
  weeklyBorrowApy?: number | null
  apyAtTarget?: number | null
  totalLiquidity?: string | null
  totalLiquidityUsd?: number | null
  dailyPriceVariation?: number | null
}

export interface MarketStateReward {
  supplyApr?: number | null
  borrowApr?: number | null
  asset: Asset
}

export interface Chain {
  id: number
  network: string
  currency: string
  blockTimeMs?: number | null
}

export interface Oracle {
  id: string
  address: string
  type: OracleType
  chain: Chain
}

export enum OracleType {
  ChainlinkOracle = "ChainlinkOracle",
  ChainlinkOracleV2 = "ChainlinkOracleV2",
  CustomOracle = "CustomOracle",
  Unknown = "Unknown",
}

export interface Vault {
  id: string
  address: string
  symbol: string
  name: string
  chain: Chain
}

export interface PageInfo {
  countTotal: number
  count: number
  limit: number
  skip: number
}

export interface MarketsResponse {
  markets: {
    items: Market[]
    pageInfo?: PageInfo
  }
}

export interface MarketBadDebt {
  underlying: string
  usd?: number | null
}

export interface MarketWarning {
  type: string
  level: 'YELLOW' | 'RED'
}

export interface MarketResponse {
  marketByUniqueKey: Market
}
