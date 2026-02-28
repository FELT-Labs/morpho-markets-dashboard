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
  currentApy: number
  average7dApy: number
  expectedReturn: number
  expectedRisk: number
  sharpe: number
  items: PortfolioItem[]
  eligibleMarkets: number
  targetApyMin: number
  targetApyMax: number
}

export interface BenchmarkPortfolioMetrics {
  currentApy: number
  average7dApy: number
  expectedReturn: number
  expectedRisk: number
  sharpe: number
  activeMarkets: number
}

export interface PortfolioPerformancePoint {
  timestamp: number
  recommendedReturn?: number
  sovaReturn?: number
  recommendedApy?: number
  sovaApy?: number
}
