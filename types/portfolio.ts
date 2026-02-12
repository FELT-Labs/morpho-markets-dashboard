import { Market } from '@/types/market'

export interface PortfolioItem {
  uniqueKey: string
  market?: Market
  weight: number
  meanApy?: number
  // Used for Sova items where market info might not be fully available
  symbolDisplay?: string 
}

export interface PortfolioMetrics {
  expectedReturn: number
  expectedRisk: number
  sharpe: number
  items: PortfolioItem[]
}
