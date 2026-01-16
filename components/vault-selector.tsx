'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  getMultipleVaultAllocations, 
  getMarketToVaultsMap,
  VaultMarketExposure 
} from '@/lib/services/vault-service'
import { Vault } from '@/types/vault'
import { Loader2 } from 'lucide-react'

// Hardcoded vault addresses for Ethereum USDC
const VAULT_ADDRESSES = {
  ethereum: {
    usdc: [
      '0x4F2ba48FaF0bA42c4E4b7871d3861418c83aE568',
      '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
      '0xdd0f28e19C1780eb6396170735D45153D261490d',
      '0xc582F04d8a82795aa2Ff9c8bb4c1c889fe7b754e',
    ]
  }
}

// Color palette for vaults
const VAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

interface VaultSelectorProps {
  chain: string
  loanAsset: string
  onVaultMarketsChange: (marketToVaults: Map<string, VaultMarketExposure[]>) => void
}

export function VaultSelector({ chain, loanAsset, onVaultMarketsChange }: VaultSelectorProps) {
  const [vaults, setVaults] = useState<Vault[]>([])
  const [selectedVaultAddresses, setSelectedVaultAddresses] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map())

  // Get vault addresses for the current chain/loanAsset pair
  const vaultAddresses = VAULT_ADDRESSES[chain as keyof typeof VAULT_ADDRESSES]?.[loanAsset as keyof typeof VAULT_ADDRESSES.ethereum] || []

  useEffect(() => {
    const fetchVaults = async () => {
      if (vaultAddresses.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const chainId = chain === 'ethereum' ? 1 : 1
        const fetchedVaults = await getMultipleVaultAllocations(vaultAddresses, chainId)
        setVaults(fetchedVaults)
        
        // Create color map for vaults
        const newColorMap = new Map<string, string>()
        fetchedVaults.forEach((vault, index) => {
          newColorMap.set(
            vault.address.toLowerCase(), 
            VAULT_COLORS[index % VAULT_COLORS.length]
          )
        })
        setColorMap(newColorMap)
      } catch (err) {
        console.error('Error fetching vaults:', err)
        setError('Failed to load vault data')
      } finally {
        setLoading(false)
      }
    }

    fetchVaults()
  }, [chain, loanAsset, vaultAddresses])

  useEffect(() => {
    // When selected vaults change, compute the market-to-vaults mapping
    const selectedVaults = vaults.filter(vault => 
      selectedVaultAddresses.has(vault.address.toLowerCase())
    )
    const marketToVaults = getMarketToVaultsMap(selectedVaults, colorMap)
    onVaultMarketsChange(marketToVaults)
  }, [selectedVaultAddresses, vaults, colorMap, onVaultMarketsChange])

  const handleVaultToggle = (address: string) => {
    const normalizedAddress = address.toLowerCase()
    setSelectedVaultAddresses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(normalizedAddress)) {
        newSet.delete(normalizedAddress)
      } else {
        newSet.add(normalizedAddress)
      }
      return newSet
    })
  }

  if (vaultAddresses.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className="mb-6 p-4 rounded-lg border bg-card">
        <h3 className="text-sm font-semibold mb-3">Highlight with Vault Exposure</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading vaults...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
        <h3 className="text-sm font-semibold mb-2 text-red-800 dark:text-red-200">
          Failed to Load Vaults
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      </div>
    )
  }

  if (vaults.length === 0) {
    return null
  }

  return (
    <div className="mb-6 p-4 rounded-lg border bg-card">
      <h3 className="text-sm font-semibold mb-3">Highlight with Vault Exposure</h3>
      <div className="flex flex-wrap gap-4">
        {vaults.map(vault => {
          const vaultColor = colorMap.get(vault.address.toLowerCase())
          const vaultUrl = `https://app.morpho.org/${chain}/vault/${vault.address}`
          
          return (
            <Checkbox
              key={vault.address}
              label={
                <span className="flex flex-col gap-1">
                  <a
                    href={vaultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {vault.name || vault.symbol}
                  </a>
                  <span className="flex items-center gap-2">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${vaultColor}20`,
                        color: vaultColor,
                        borderLeft: `3px solid ${vaultColor}`
                      }}
                    >
                      {vault.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {vault.state.allocation.length} market{vault.state.allocation.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                </span>
              }
              checked={selectedVaultAddresses.has(vault.address.toLowerCase())}
              onChange={() => handleVaultToggle(vault.address)}
            />
          )
        })}
      </div>
    </div>
  )
}
