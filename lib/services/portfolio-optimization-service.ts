import { Market } from '@/types/market'
import { MeanVarianceOptimizer } from 'meridianalgo/dist/portfolio/mean-variance'
import { calculateStandardDeviation } from '@/lib/utils/math'
import { PortfolioMetrics, PortfolioItem } from '@/types/portfolio'
import { Vault } from '@/types/vault'
import { MarketHistoryData } from '@/lib/services/market-service'

interface AlignedMarket extends MarketHistoryData {
  apySeries: number[]
  meanApy: number
  volatility: number
  score: number // Sharpe score approximation (mean/vol)
}

/**
 * Core logic to optimize portfolio based on historical APY.
 * 
 * Process:
 * 1. Filter markets with sufficient history
 * 2. Align time series data
 * 3. Pre-select candidates based on risk-adjusted return (Sharpe proxy)
 * 4. Run unconstrained Mean-Variance Optimization
 * 5. Filter top 10 allocations
 * 6. Run constrained optimization on top 10 (min 5% weight)
 */
export async function optimizePortfolio(markets: MarketHistoryData[]): Promise<PortfolioMetrics | null> {
  const validMarkets = markets.filter(m => 
    m.historicalState?.netSupplyApy?.length >= 5
  )

  if (validMarkets.length === 0) {
    return null
  }

  // Ensure all series have the same length for matrix calculation by taking the shortest length
  const minLength = Math.min(...validMarkets.map(m => m.historicalState.netSupplyApy.length))
  
  const alignedMarkets: AlignedMarket[] = validMarkets.map(m => {
    const history = m.historicalState.netSupplyApy
    const trimmed = history.slice(history.length - minLength)
    const apySeries = trimmed.map(d => d.y)
    
    // Compute basic metrics for pre-filtering
    const meanApy = apySeries.reduce((a, b) => a + b, 0) / apySeries.length
    const volatility = Math.max(calculateStandardDeviation(apySeries), 0.0001)
    const score = meanApy / volatility

    return {
      ...m,
      apySeries,
      meanApy,
      volatility,
      score
    }
  })

  // Pre-selection: Top 50 by simple Sharpe score
  const topMarkets = alignedMarkets
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  if (topMarkets.length === 0) {
    return null
  }

  // Prepare inputs for optimizer
  const returnsMatrix = topMarkets.map(m => m.apySeries)
  const numTimeSteps = returnsMatrix[0]?.length || 0
  
  const optimizationInput = Array.from({ length: numTimeSteps }, (_, t) => 
    returnsMatrix.map(assetSeries => assetSeries[t])
  )

  const optimizer = new MeanVarianceOptimizer()
  const initialResult = optimizer.optimize(
    optimizationInput, 
    topMarkets.map(m => m.uniqueKey), 
    {
      minWeight: 0,
      maxWeight: 1,
    }
  )

  const top10Indices = initialResult.weights
    .map((w, i) => ({ weight: w, index: i }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)
    .map(item => item.index)

  const finalMarkets = top10Indices.map(i => topMarkets[i])

  // Re-build inputs for the focused group
  const finalReturnsMatrix = finalMarkets.map(m => m.apySeries)
  const finalOptimizationInput = Array.from({ length: numTimeSteps }, (_, t) => 
    finalReturnsMatrix.map(assetSeries => assetSeries[t])
  )
  
  const optimizationResult = optimizer.optimize(
    finalOptimizationInput, 
    finalMarkets.map(m => m.uniqueKey), 
    {
      minWeight: 0.05, 
      maxWeight: 1,
    }
  )

  // Map results to PortfolioItems
  const items: PortfolioItem[] = finalMarkets.map((m, i) => ({
    uniqueKey: m.uniqueKey,
    market: m,
    weight: optimizationResult.weights[i],
    meanApy: m.meanApy
  }))
  .filter(item => item.weight > 0.001) // Filter dust
  .sort((a, b) => b.weight - a.weight)

  return {
    expectedReturn: optimizationResult.expectedReturn || 0,
    expectedRisk: optimizationResult.expectedRisk || 0,
    sharpe: optimizationResult.sharpe || 0,
    items
  }
}

/**
 * Extracts allocation from a specific vault (e.g. Sova) for comparison.
 */
export function getBenchmarkPortfolio(vault: Vault | undefined, allMarkets: MarketHistoryData[]): PortfolioItem[] {
  if (!vault || !vault.state.totalAssetsUsd) return []

  const totalAssets = vault.state.totalAssetsUsd || 1

  return vault.state.allocation.map(alloc => {
    // Try to find the detailed market object
    const market = allMarkets.find(m => m.uniqueKey === alloc.market.uniqueKey)
    
    // Calculate mean APY if history is present
    let meanApy: number | undefined
    if (market && market.historicalState?.netSupplyApy?.length > 0) {
      const history = market.historicalState.netSupplyApy.map(d => d.y)
      meanApy = history.reduce((a, b) => a + b, 0) / history.length
    }

    const weight = (alloc.supplyAssetsUsd || 0) / totalAssets

    return {
      uniqueKey: alloc.market.uniqueKey,
      market, // Might be undefined if not in the top 100 fetched
      weight,
      meanApy
    }
  })
  .filter(p => p.weight > 0.001) // Filter dust
  .sort((a, b) => b.weight - a.weight)
}
