/**
 * specific math utilities for portfolio calculations
 */

export function calculateStandardDeviation(data: number[]): number {
  if (data.length < 2) return 0
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  // Population std dev commonly used for volatility in this context
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  return Math.sqrt(variance)
}
