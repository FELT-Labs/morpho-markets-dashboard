/**
 * GraphQL response types and API-specific interfaces
 */

import { Market, Chain } from './market'

/**
 * Asset interface for GraphQL responses
 */
export interface AssetGraphQL {
  id: string
  symbol: string
  address: string
  name: string
  logoURI?: string | null
  chain: {
    id: number
    network: string
  }
}

/**
 * Assets query response
 */
export interface AssetsResponse {
  assets: {
    items: AssetGraphQL[]
  }
}

/**
 * Grouped assets by symbol with all addresses
 */
export interface AssetGroup {
  symbol: string
  addresses: string[]
}

/**
 * Chain response from GraphQL
 */
export interface ChainsResponse {
  chains: Chain[]
}
