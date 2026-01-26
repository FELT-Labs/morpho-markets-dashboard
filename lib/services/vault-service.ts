import { graphQLClient } from '@/lib/graphql/client'
import { Vault } from '@/types/vault'

const GET_VAULT_ALLOCATIONS_QUERY = `
  query GetVaultAllocations($address: String!, $chainId: Int!) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      name
      symbol
      state {
        totalAssetsUsd
        allocation {
          supplyAssets
          supplyAssetsUsd
          market {
            uniqueKey
          }
        }
      }
    }
  }
`

export async function getVaultAllocations(
  address: string,
  chainId: number = 1
): Promise<Vault> {
  try {
    const data = await graphQLClient.request<{ vaultByAddress: Vault }>(
      GET_VAULT_ALLOCATIONS_QUERY,
      {
        address,
        chainId
      }
    )

    return data.vaultByAddress
  } catch (error) {
    console.error('Error fetching vault allocations:', error)
    throw error
  }
}

export async function getMultipleVaultAllocations(
  addresses: string[],
  chainId: number = 1
): Promise<Vault[]> {
  try {
    const vaultPromises = addresses.map(address => 
      getVaultAllocations(address, chainId)
    )
    
    return await Promise.all(vaultPromises)
  } catch (error) {
    console.error('Error fetching multiple vault allocations:', error)
    throw error
  }
}

export function getMarketKeysFromVaults(vaults: Vault[]): Set<string> {
  const marketKeys = new Set<string>()
  
  vaults.forEach(vault => {
    vault.state.allocation.forEach(allocation => {
      marketKeys.add(allocation.market.uniqueKey)
    })
  })
  
  return marketKeys
}

export interface VaultMarketExposure {
  vaultAddress: string
  vaultName: string
  vaultSymbol: string
  color: string
  allocationUsd: number
  allocationPercentage: number
}

export function getMarketToVaultsMap(
  vaults: Vault[],
  colorMap: Map<string, string>
): Map<string, VaultMarketExposure[]> {
  const marketToVaults = new Map<string, VaultMarketExposure[]>()
  
  vaults.forEach(vault => {
    const totalAssetsUsd = vault.state.totalAssetsUsd || 0
    
    vault.state.allocation.forEach(allocation => {
      const allocationUsd = allocation.supplyAssetsUsd || 0
      const allocationPercentage = totalAssetsUsd > 0 
        ? (allocationUsd / totalAssetsUsd) * 100 
        : 0
      
      const exposure: VaultMarketExposure = {
        vaultAddress: vault.address,
        vaultName: vault.name,
        vaultSymbol: vault.symbol,
        color: colorMap.get(vault.address.toLowerCase()) || '#6B7280',
        allocationUsd,
        allocationPercentage
      }
      
      const marketKey = allocation.market.uniqueKey
      const existing = marketToVaults.get(marketKey) || []
      marketToVaults.set(marketKey, [...existing, exposure])
    })
  })
  
  return marketToVaults
}
