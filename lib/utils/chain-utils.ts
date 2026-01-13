/**
 * Chain-related utility functions
 */

import { CHAIN_CONFIG } from '@/lib/constants/query-config'

// Chain name to ID mapping
const CHAIN_NAME_TO_ID: Record<string, number> = {
  ethereum: CHAIN_CONFIG.ETHEREUM.id,
  base: CHAIN_CONFIG.BASE.id,
}

// Chain ID to name mapping
const CHAIN_ID_TO_NAME: Record<number, string> = {
  [CHAIN_CONFIG.ETHEREUM.id]: CHAIN_CONFIG.ETHEREUM.name,
  [CHAIN_CONFIG.BASE.id]: CHAIN_CONFIG.BASE.name,
}

// Chain ID to label mapping
const CHAIN_ID_TO_LABEL: Record<number, string> = {
  [CHAIN_CONFIG.ETHEREUM.id]: CHAIN_CONFIG.ETHEREUM.label,
  [CHAIN_CONFIG.BASE.id]: CHAIN_CONFIG.BASE.label,
}

/**
 * Convert chain name to chain ID
 * @throws Error if chain name is unknown
 */
export function getChainIdFromName(name: string): number {
  const lowerName = name.toLowerCase()
  const chainId = CHAIN_NAME_TO_ID[lowerName]
  if (!chainId) {
    throw new Error(`Unknown chain name: ${name}`)
  }
  return chainId
}

/**
 * Convert chain ID to chain name
 * @throws Error if chain ID is unknown
 */
export function getChainNameFromId(id: number): string {
  const chainName = CHAIN_ID_TO_NAME[id]
  if (!chainName) {
    throw new Error(`Unknown chain ID: ${id}`)
  }
  return chainName
}

/**
 * Convert chain ID to human-readable label
 */
export function getChainLabel(chainId: number): string {
  return CHAIN_ID_TO_LABEL[chainId] || `Chain ${chainId}`
}

/**
 * Capitalize chain name to label
 */
export function capitalizeChainName(chainName: string): string {
  return chainName.charAt(0).toUpperCase() + chainName.slice(1)
}

/**
 * Get explorer URL for an address on a given chain
 */
export function getExplorerUrl(chainId: number, address: string): string {
  switch (chainId) {
    case CHAIN_CONFIG.ETHEREUM.id:
      return `https://etherscan.io/address/${address}`
    case CHAIN_CONFIG.BASE.id:
      return `https://basescan.org/address/${address}`
    default:
      return `https://etherscan.io/address/${address}`
  }
}
