/**
 * Market Configuration tab component
 */

import { Market } from '@/types'
import { CategorySection } from '../category-section'
import { Settings, Database, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatAddress, formatCurrency, formatTimestamp } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/utils/chain-utils'

interface ConfigTabProps {
  market: Market
}

export function ConfigTab({ market }: ConfigTabProps) {
  const chainId = market.morphoBlue.chain.id
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CategorySection title="Market Parameters" icon={Settings} accent="purple">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market ID</span>
            <span className="font-mono text-xs">{market.uniqueKey.slice(0, 10)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Creation Block</span>
            <span className="font-medium">{market.creationBlockNumber.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Creation Date</span>
            <span className="font-medium">
              {formatTimestamp(market.creationTimestamp)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={market.listed ? "default" : "secondary"}>
              {market.listed ? "Listed" : "Unlisted"}
            </Badge>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-muted-foreground">IRM Address</span>
            <a
              href={getExplorerUrl(chainId, market.irmAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:text-primary inline-flex items-center gap-1"
            >
              {formatAddress(market.irmAddress)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CategorySection>
      
      <CategorySection title="Assets" icon={Settings} accent="blue">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Loan Asset</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{market.loanAsset.symbol}</div>
                <div className="text-sm text-muted-foreground">{market.loanAsset.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-mono">
                  {formatAddress(market.loanAsset.address)}
                </div>
                {market.loanAsset.priceUsd && (
                  <div className="text-sm font-medium">
                    {formatCurrency(market.loanAsset.priceUsd)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {market.collateralAsset && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Collateral Asset</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{market.collateralAsset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{market.collateralAsset.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatAddress(market.collateralAsset.address)}
                  </div>
                  {market.collateralAsset.priceUsd && (
                    <div className="text-sm font-medium">
                      {formatCurrency(market.collateralAsset.priceUsd)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CategorySection>
      
      {market.supplyingVaults && market.supplyingVaults.length > 0 && (
        <div className="md:col-span-2">
          <CategorySection title="Supplying Vaults" icon={Database} accent="green">
            <div className="space-y-2">
              {market.supplyingVaults.map((vault) => (
                <div key={vault.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{vault.symbol}</div>
                    <div className="text-sm text-muted-foreground">{vault.name}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{vault.chain.network}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      )}
    </div>
  )
}
