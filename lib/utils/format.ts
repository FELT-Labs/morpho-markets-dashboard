export function formatUSD(value: number | undefined | null, compact: boolean = false): string {
  if (value === undefined || value === null) return '-'
  
  if (compact) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return '-'
  
  // Morpho API returns APY as a decimal (e.g., 0.05 for 5%)
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatBigInt(value: string | bigint, decimals: number): number {
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value
  const divisor = BigInt(10 ** decimals)
  const quotient = bigIntValue / divisor
  const remainder = bigIntValue % divisor
  
  return Number(quotient) + Number(remainder) / Number(divisor)
}

export function formatNumber(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return '-'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
