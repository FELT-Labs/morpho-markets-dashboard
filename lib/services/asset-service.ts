/**
 * Asset-related data fetching service
 */

import { graphQLClient } from '@/lib/graphql/client'
import { GET_ASSETS_QUERY } from '@/lib/graphql/queries'
import { QUERY_DEFAULTS } from '@/lib/constants/query-config'
import { AssetsResponse, AssetGraphQL, AssetGroup } from '@/types/graphql'

/**
 * Fetch all assets for a given chain
 */
export async function fetchAssets(chainId: number): Promise<AssetGraphQL[]> {
  try {
    const data = await graphQLClient.request<AssetsResponse>(GET_ASSETS_QUERY, {
      first: QUERY_DEFAULTS.ASSETS_PAGE_SIZE,
      chainId_in: [chainId],
    })
    
    return data.assets.items
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    return []
  }
}

/**
 * Fetch assets grouped by symbol with all addresses
 */
export async function fetchAssetsGroupedBySymbol(chainId: number): Promise<AssetGroup[]> {
  try {
    const assets = await fetchAssets(chainId)
    
    // Group assets by symbol and collect all addresses
    const assetsBySymbol = new Map<string, AssetGroup>()
    
    assets.forEach((asset) => {
      if (!assetsBySymbol.has(asset.symbol)) {
        assetsBySymbol.set(asset.symbol, {
          symbol: asset.symbol,
          addresses: [],
        })
      }
      assetsBySymbol.get(asset.symbol)!.addresses.push(asset.address)
    })
    
    return Array.from(assetsBySymbol.values())
  } catch (error) {
    console.error('Failed to fetch grouped assets:', error)
    return []
  }
}

/**
 * Fetch addresses for a specific asset symbol on a chain
 */
export async function fetchAssetAddresses(
  chainId: number,
  symbol: string
): Promise<string[]> {
  try {
    const assets = await fetchAssets(chainId)
    
    return assets
      .filter(asset => asset.symbol.toLowerCase() === symbol.toLowerCase())
      .map(asset => asset.address)
  } catch (error) {
    console.error(`Failed to fetch addresses for ${symbol}:`, error)
    return []
  }
}

/**
 * Find asset group by symbol
 */
export async function findAssetBySymbol(
  chainId: number,
  symbol: string
): Promise<AssetGroup | null> {
  try {
    const groupedAssets = await fetchAssetsGroupedBySymbol(chainId)
    return groupedAssets.find(
      asset => asset.symbol.toLowerCase() === symbol.toLowerCase()
    ) || null
  } catch (error) {
    console.error(`Failed to find asset ${symbol}:`, error)
    return null
  }
}
