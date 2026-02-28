import {
  BenchmarkPortfolioMetrics,
  PortfolioItem,
  PortfolioMetrics,
  PortfolioPerformancePoint,
} from '@/types/portfolio'
import { MarketHistoryData } from '@/lib/services/market-service'
import { Vault } from '@/types/vault'

const MIN_HISTORY_POINTS = 5
const MIN_WEIGHT = 0.05
const MAX_CANDIDATES = 12
const SEARCH_ITERATIONS = 3000
const TARGET_APY_MIN = 0.07
const TARGET_APY_MAX = 0.08
const TARGET_APY_MID = (TARGET_APY_MIN + TARGET_APY_MAX) / 2

interface CandidateMarket extends MarketHistoryData {
  apySeries: number[]
  meanApy: number
}

interface CandidatePortfolio {
  weights: number[]
  expectedReturn: number
  expectedRisk: number
  sharpe: number
  targetGap: number
}

interface WeightedSeries {
  weight: number
  series: { x: number; y: number }[]
}

interface PortfolioItemWithHistory extends PortfolioItem {
  market: MarketHistoryData
}

/**
 * Optimizes a long-only portfolio toward a 7-8% APY band while penalizing APY variance.
 */
export async function optimizePortfolio(markets: MarketHistoryData[]): Promise<PortfolioMetrics | null> {
  const eligibleMarkets = selectEligibleMarkets(markets)

  if (eligibleMarkets.length === 0) {
    return null
  }

  const covarianceMatrix = buildCovarianceMatrix(eligibleMarkets.map((market) => market.apySeries))
  const bestPortfolio = searchBestPortfolio(eligibleMarkets, covarianceMatrix)

  const items: PortfolioItem[] = eligibleMarkets
    .map((market, index) => ({
      uniqueKey: market.uniqueKey,
      market,
      weight: bestPortfolio.weights[index],
      meanApy: market.meanApy,
    }))
    .filter((item) => item.weight >= MIN_WEIGHT)
    .sort((a, b) => b.weight - a.weight)

  return {
    currentApy: calculateWeightedCurrentApy(items),
    average7dApy: calculateWeightedAverageApy(items, 7),
    expectedReturn: bestPortfolio.expectedReturn,
    expectedRisk: bestPortfolio.expectedRisk,
    sharpe: bestPortfolio.sharpe,
    items,
    eligibleMarkets: eligibleMarkets.length,
    targetApyMin: TARGET_APY_MIN,
    targetApyMax: TARGET_APY_MAX,
  }
}

/**
 * Extracts allocation from a specific vault for comparison against the optimized mix.
 */
export function getBenchmarkPortfolio(vault: Vault | undefined, allMarkets: MarketHistoryData[]): PortfolioItem[] {
  if (!vault || !vault.state.totalAssetsUsd) {
    return []
  }

  const totalAssets = vault.state.totalAssetsUsd || 1

  return vault.state.allocation
    .map((allocation) => {
      const market = allMarkets.find((item) => item.uniqueKey === allocation.market.uniqueKey)
      const history = market?.historicalState?.netSupplyApy ?? []
      const meanApy = history.length > 0
        ? history.reduce((sum, point) => sum + point.y, 0) / history.length
        : undefined

      return {
        uniqueKey: allocation.market.uniqueKey,
        market,
        weight: (allocation.supplyAssetsUsd || 0) / totalAssets,
        meanApy,
      }
    })
    .filter((item) => item.weight > 0.001)
    .sort((a, b) => b.weight - a.weight)
}

/**
 * Calculates portfolio-level APY and APY standard deviation from weighted market history.
 */
export function calculatePortfolioMetrics(items: PortfolioItem[]): BenchmarkPortfolioMetrics | null {
  const weightedSeries = getWeightedHistorySeries(items)

  if (weightedSeries.length === 0) {
    return null
  }

  const normalizedWeights = normalizeWeights(weightedSeries.map((item) => item.weight))
  if (!normalizedWeights) {
    return null
  }

  const minSeriesLength = Math.min(...weightedSeries.map((item) => item.series.length))
  const aggregatedSeries = Array.from({ length: minSeriesLength }, (_, index) =>
    weightedSeries.reduce((sum, item, itemIndex) => {
      const value = item.series[item.series.length - minSeriesLength + index]?.y ?? 0
      return sum + normalizedWeights[itemIndex] * value
    }, 0),
  )

  const expectedReturn = average(aggregatedSeries)
  const expectedRisk = Math.sqrt(calculateVariance(aggregatedSeries))

  return {
    currentApy: calculateWeightedCurrentApy(items),
    average7dApy: calculateWeightedAverageApy(items, 7),
    expectedReturn,
    expectedRisk,
    sharpe: expectedRisk > 0 ? expectedReturn / expectedRisk : expectedReturn,
    activeMarkets: items.length,
  }
}

/**
 * Builds a normalized historical performance series from weighted portfolio APY.
 */
export function calculatePortfolioPerformanceSeries(
  portfolios: Array<{ key: 'recommended' | 'sova'; items: PortfolioItem[] }>,
): PortfolioPerformancePoint[] {
  const seriesByPortfolio = portfolios
    .map(({ key, items }) => {
      const weightedSeries = buildWeightedPortfolioSeries(items)
      if (!weightedSeries) {
        return null
      }

      return { key, weightedSeries }
    })
    .filter((entry): entry is { key: 'recommended' | 'sova'; weightedSeries: Array<{ timestamp: number; apy: number }> } => entry !== null)

  if (seriesByPortfolio.length === 0) {
    return []
  }

  const minSeriesLength = Math.min(...seriesByPortfolio.map((entry) => entry.weightedSeries.length))
  const alignedSeries = seriesByPortfolio.map((entry) => ({
    key: entry.key,
    points: entry.weightedSeries.slice(-minSeriesLength),
  }))

  return Array.from({ length: minSeriesLength }, (_, index) => {
    const point: PortfolioPerformancePoint = {
      timestamp: alignedSeries[0].points[index].timestamp,
    }

    alignedSeries.forEach((entry) => {
      const dailyApy = entry.points[index].apy
      const cumulativeValue = calculateCumulativeValue(entry.points, index)

      if (entry.key === 'recommended') {
        point.recommendedApy = dailyApy
        point.recommendedReturn = cumulativeValue
      } else {
        point.sovaApy = dailyApy
        point.sovaReturn = cumulativeValue
      }
    })

    return point
  })
}

// Filters temporary and illiquid markets, aligns history, then keeps the strongest candidates.
function selectEligibleMarkets(markets: MarketHistoryData[]): CandidateMarket[] {
  const alignedMarkets = markets
    .filter((market) => market.state.supplyAssetsUsd !== undefined && market.state.supplyAssetsUsd >= 500000)
    .filter((market) => !isTemporaryMarket(market))
    .filter((market) => market.historicalState?.netSupplyApy?.length >= MIN_HISTORY_POINTS)

  if (alignedMarkets.length === 0) {
    return []
  }

  const minSeriesLength = Math.min(...alignedMarkets.map((market) => market.historicalState.netSupplyApy.length))

  return alignedMarkets
    .map((market) => {
      const apySeries = market.historicalState.netSupplyApy
        .slice(-minSeriesLength)
        .map((point) => point.y)

      return {
        ...market,
        apySeries,
        meanApy: average(apySeries),
      }
    })
    .sort((left, right) => scoreCandidate(right) - scoreCandidate(left))
    .slice(0, MAX_CANDIDATES)
}

// Flags temporary PT markets from either symbol or name fields.
function isTemporaryMarket(market: MarketHistoryData): boolean {
  const labels = [
    market.collateralAsset?.symbol,
    market.collateralAsset?.name,
    market.loanAsset.symbol,
    market.loanAsset.name,
  ]

  return labels.some((value) => value?.startsWith('PT-'))
}

// Uses a small stochastic search over the simplex to balance return and variance.
function searchBestPortfolio(markets: CandidateMarket[], covarianceMatrix: number[][]): CandidatePortfolio {
  let bestInBand: CandidatePortfolio | null = null
  let bestFallback: CandidatePortfolio | null = null
  const random = createSeededRandom(markets.map((market) => market.uniqueKey).join('|'))

  for (let iteration = 0; iteration < SEARCH_ITERATIONS; iteration += 1) {
    const weights = sampleWeights(markets.length, random)
    const candidate = evaluatePortfolio(markets, covarianceMatrix, weights)

    if (isWithinTargetBand(candidate.expectedReturn)) {
      if (!bestInBand || compareTargetPortfolios(candidate, bestInBand) < 0) {
        bestInBand = candidate
      }
      continue
    }

    if (!bestFallback || compareFallbackPortfolios(candidate, bestFallback) < 0) {
      bestFallback = candidate
    }
  }

  const equalWeightCandidate = evaluatePortfolio(
    markets,
    covarianceMatrix,
    Array.from({ length: markets.length }, () => 1 / markets.length),
  )

  if (isWithinTargetBand(equalWeightCandidate.expectedReturn)) {
    if (!bestInBand || compareTargetPortfolios(equalWeightCandidate, bestInBand) < 0) {
      bestInBand = equalWeightCandidate
    }
  } else if (!bestFallback || compareFallbackPortfolios(equalWeightCandidate, bestFallback) < 0) {
    bestFallback = equalWeightCandidate
  }

  return bestInBand ?? bestFallback ?? equalWeightCandidate
}

function compareTargetPortfolios(left: CandidatePortfolio, right: CandidatePortfolio): number {
  const returnDelta = right.expectedReturn - left.expectedReturn
  if (Math.abs(returnDelta) > 0.001) {
    return returnDelta
  }

  return left.expectedRisk - right.expectedRisk
}

function compareFallbackPortfolios(left: CandidatePortfolio, right: CandidatePortfolio): number {
  const gapDelta = left.targetGap - right.targetGap
  if (Math.abs(gapDelta) > 0.001) {
    return gapDelta
  }

  const sharpeDelta = right.sharpe - left.sharpe
  if (Math.abs(sharpeDelta) > 0.001) {
    return sharpeDelta
  }

  return left.expectedRisk - right.expectedRisk
}

function evaluatePortfolio(
  markets: CandidateMarket[],
  covarianceMatrix: number[][],
  weights: number[],
): CandidatePortfolio {
  const expectedReturn = dot(weights, markets.map((market) => market.meanApy))
  const expectedVariance = quadraticForm(weights, covarianceMatrix)
  const expectedRisk = Math.sqrt(Math.max(expectedVariance, 0))

  return {
    weights,
    expectedReturn,
    expectedRisk,
    sharpe: expectedRisk > 0 ? expectedReturn / expectedRisk : expectedReturn,
    targetGap: distanceFromTargetBand(expectedReturn),
  }
}

function sampleWeights(assetCount: number, random: () => number): number[] {
  const activeAssets = Math.min(assetCount, 2 + Math.floor(random() * 3))
  const selectedIndices = shuffle(Array.from({ length: assetCount }, (_, index) => index), random).slice(0, activeAssets)
  const rawWeights = selectedIndices.map(() => random())
  const normalizedWeights = normalize(rawWeights)
  const weights = Array.from({ length: assetCount }, () => 0)

  selectedIndices.forEach((assetIndex, index) => {
    weights[assetIndex] = MIN_WEIGHT + normalizedWeights[index] * (1 - activeAssets * MIN_WEIGHT)
  })

  return weights
}

function scoreCandidate(market: CandidateMarket): number {
  const volatility = Math.sqrt(Math.max(calculateVariance(market.apySeries), 0.000001))
  const targetPenalty = Math.abs(market.meanApy - TARGET_APY_MID)

  return market.meanApy - 0.35 * volatility - 0.5 * targetPenalty
}

function buildWeightedPortfolioSeries(items: PortfolioItem[]): Array<{ timestamp: number; apy: number }> | null {
  const weightedSeries = getWeightedHistorySeries(items)

  if (weightedSeries.length === 0) {
    return null
  }

  const normalizedWeights = normalizeWeights(weightedSeries.map((item) => item.weight))
  if (!normalizedWeights) {
    return null
  }

  const minSeriesLength = Math.min(...weightedSeries.map((item) => item.series.length))

  return Array.from({ length: minSeriesLength }, (_, index) => {
    const timestamp = (weightedSeries[0].series[weightedSeries[0].series.length - minSeriesLength + index]?.x ?? 0) * 1000
    const apy = weightedSeries.reduce((sum, item, itemIndex) => {
      const value = item.series[item.series.length - minSeriesLength + index]?.y ?? 0
      return sum + normalizedWeights[itemIndex] * value
    }, 0)

    return { timestamp, apy }
  })
}

function calculateCumulativeValue(points: Array<{ timestamp: number; apy: number }>, endIndex: number): number {
  let value = 100

  for (let index = 0; index <= endIndex; index += 1) {
    value *= 1 + points[index].apy / 365
  }

  return value
}

function calculateWeightedCurrentApy(items: PortfolioItem[]): number {
  const weightedItems = items
    .filter((item) => item.market?.state.netSupplyApy !== undefined && item.weight > 0)
    .map((item) => ({
      weight: item.weight,
      apy: item.market?.state.netSupplyApy ?? 0,
    }))

  const normalizedWeights = normalizeWeights(weightedItems.map((item) => item.weight))
  if (!normalizedWeights) {
    return 0
  }

  return weightedItems.reduce((sum, item, index) => sum + normalizedWeights[index] * item.apy, 0)
}

function calculateWeightedAverageApy(items: PortfolioItem[], days: number): number {
  const weightedItems = items
    .filter(hasMarketHistory)
    .map((item) => {
      const history = item.market.historicalState.netSupplyApy
      const recentHistory = history.slice(-days)

      return {
        weight: item.weight,
        averageApy: recentHistory.length > 0
          ? average(recentHistory.map((point) => point.y))
          : 0,
      }
    })

  const normalizedWeights = normalizeWeights(weightedItems.map((item) => item.weight))
  if (!normalizedWeights) {
    return 0
  }

  return weightedItems.reduce((sum, item, index) => sum + normalizedWeights[index] * item.averageApy, 0)
}

function getWeightedHistorySeries(items: PortfolioItem[]): WeightedSeries[] {
  return items
    .filter(hasMarketHistory)
    .map((item) => ({
      weight: item.weight,
      series: item.market.historicalState.netSupplyApy,
    }))
}

function buildCovarianceMatrix(series: number[][]): number[][] {
  return series.map((leftSeries) =>
    series.map((rightSeries) => calculateCovariance(leftSeries, rightSeries)),
  )
}

function calculateCovariance(left: number[], right: number[]): number {
  const meanLeft = average(left)
  const meanRight = average(right)
  let sum = 0

  for (let index = 0; index < left.length; index += 1) {
    sum += (left[index] - meanLeft) * (right[index] - meanRight)
  }

  return sum / left.length
}

function calculateVariance(values: number[]): number {
  const mean = average(values)

  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
}

function quadraticForm(weights: number[], matrix: number[][]): number {
  let total = 0

  for (let row = 0; row < weights.length; row += 1) {
    for (let column = 0; column < weights.length; column += 1) {
      total += weights[row] * matrix[row][column] * weights[column]
    }
  }

  return total
}

function dot(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * right[index], 0)
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function normalize(values: number[]): number[] {
  const sum = values.reduce((total, value) => total + value, 0)

  return values.map((value) => value / sum)
}

function normalizeWeights(weights: number[]): number[] | null {
  if (weights.length === 0) {
    return null
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) {
    return null
  }

  return weights.map((weight) => weight / totalWeight)
}

function hasHistoricalState(market: PortfolioItem['market']): market is MarketHistoryData {
  const candidate = market as Partial<MarketHistoryData> | undefined

  return Boolean(candidate?.historicalState?.netSupplyApy?.length)
}

function hasMarketHistory(item: PortfolioItem): item is PortfolioItemWithHistory {
  return hasHistoricalState(item.market)
}

function distanceFromTargetBand(value: number): number {
  if (value < TARGET_APY_MIN) {
    return TARGET_APY_MIN - value
  }

  if (value > TARGET_APY_MAX) {
    return value - TARGET_APY_MAX
  }

  return 0
}

function isWithinTargetBand(value: number): boolean {
  return value >= TARGET_APY_MIN && value <= TARGET_APY_MAX
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const copy = [...values]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function createSeededRandom(seedInput: string): () => number {
  let seed = 0

  for (let index = 0; index < seedInput.length; index += 1) {
    seed = (seed * 31 + seedInput.charCodeAt(index)) >>> 0
  }

  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0
    return seed / 4294967296
  }
}
