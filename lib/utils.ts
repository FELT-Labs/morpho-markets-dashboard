import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export commonly used utilities from other modules
export { 
  getChainIdFromName, 
  getChainNameFromId,
  getChainLabel,
  capitalizeChainName,
  getExplorerUrl
} from './utils/chain-utils'

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"
  return `${(value * 100).toFixed(2)}%`
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Parse timestamp to Date object
 */
export function parseTimestamp(timestamp: string | number): Date {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  return new Date(ts * 1000)
}

/**
 * Format timestamp to locale date string
 */
export function formatTimestamp(timestamp: string | number): string {
  return parseTimestamp(timestamp).toLocaleDateString()
}

/**
 * Format timestamp to locale date and time string
 */
export function formatTimestampFull(timestamp: string | number): string {
  return parseTimestamp(timestamp).toLocaleString()
}

/**
 * Format large numbers with M/K suffix
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toFixed(2)
}

export function formatBigInt(value: string | null | undefined, decimals: number = 18): string {
  if (!value || value === "0") return "0"
  
  try {
    const bigIntValue = BigInt(value)
    if (bigIntValue === BigInt(0)) return "0"
    
    // Convert to number with decimals
    const divisor = Math.pow(10, decimals)
    const numValue = Number(bigIntValue) / divisor
    
    // Format with appropriate precision
    if (numValue >= 1_000_000) {
      return `${(numValue / 1_000_000).toFixed(2)}M`
    }
    if (numValue >= 1_000) {
      return `${(numValue / 1_000).toFixed(2)}K`
    }
    if (numValue >= 1) {
      return numValue.toFixed(2)
    }
    // For small numbers, show more decimals
    return numValue.toFixed(6)
  } catch {
    return value
  }
}
