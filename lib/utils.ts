import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

// Chain name to ID mapping
const CHAIN_NAME_TO_ID: Record<string, number> = {
  ethereum: 1,
  base: 8453,
}

// Chain ID to name mapping
const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: "ethereum",
  8453: "base",
}

export function getChainIdFromName(name: string): number {
  const lowerName = name.toLowerCase()
  const chainId = CHAIN_NAME_TO_ID[lowerName]
  if (!chainId) {
    throw new Error(`Unknown chain name: ${name}`)
  }
  return chainId
}

export function getChainNameFromId(id: number): string {
  const chainName = CHAIN_ID_TO_NAME[id]
  if (!chainName) {
    throw new Error(`Unknown chain ID: ${id}`)
  }
  return chainName
}
