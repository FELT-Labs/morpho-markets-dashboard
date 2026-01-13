/**
 * Oracle Health tab component
 */

import { Market } from '@/types'
import { MetricCard } from '../metric-card'
import { CategorySection } from '../category-section'
import { OracleHealthBadge } from '../oracle-health-badge'
import { Database, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/utils'
import { useMarketMetrics } from '@/hooks/use-market-metrics'
import { getExplorerUrl } from '@/lib/utils/chain-utils'

interface OracleTabProps {
  market: Market
}

export function OracleTab({ market }: OracleTabProps) {
  const { hasOracleWarning } = useMarketMetrics(market)
  const chainId = market.morphoBlue.chain.id
  
  if (!market.oracle) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No oracle information available for this market
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <OracleHealthBadge 
          oracleType={market.oracle.type} 
          hasOracleWarning={hasOracleWarning}
          showIcon
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection title="Oracle Configuration" icon={Database} accent="blue">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline">{market.oracle.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <a
                href={getExplorerUrl(chainId, market.oracle.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm hover:text-primary inline-flex items-center gap-1"
              >
                {formatAddress(market.oracle.address)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {market.oracle.chain && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain</span>
                <Badge variant="secondary">{market.oracle.chain.network}</Badge>
              </div>
            )}
          </div>
        </CategorySection>
        
        {market.state?.price && (
          <MetricCard
            title="Current Price"
            value={market.state.price}
            metricKey="price"
            description="Collateral price in loan token"
          />
        )}
      </div>
      
      {market.oracle.data && (
        <CategorySection title="Oracle Feeds" icon={Database} accent="purple">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {'baseFeedOne' in market.oracle.data && market.oracle.data.baseFeedOne && (
              <div>
                <div className="text-sm font-medium mb-2">Base Feed 1</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatAddress(market.oracle.data.baseFeedOne.address)}
                </div>
              </div>
            )}
            {'baseFeedTwo' in market.oracle.data && market.oracle.data.baseFeedTwo && (
              <div>
                <div className="text-sm font-medium mb-2">Base Feed 2</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatAddress(market.oracle.data.baseFeedTwo.address)}
                </div>
              </div>
            )}
            {'quoteFeedOne' in market.oracle.data && market.oracle.data.quoteFeedOne && (
              <div>
                <div className="text-sm font-medium mb-2">Quote Feed 1</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatAddress(market.oracle.data.quoteFeedOne.address)}
                </div>
              </div>
            )}
            {'quoteFeedTwo' in market.oracle.data && market.oracle.data.quoteFeedTwo && (
              <div>
                <div className="text-sm font-medium mb-2">Quote Feed 2</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatAddress(market.oracle.data.quoteFeedTwo.address)}
                </div>
              </div>
            )}
          </div>
        </CategorySection>
      )}
    </div>
  )
}
