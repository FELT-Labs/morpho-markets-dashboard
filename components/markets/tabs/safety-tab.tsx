/**
 * Safety & Risk tab component
 */

import { Market } from '@/types'
import { SafetyIndicator } from '../safety-indicator'
import { MetricCard } from '../metric-card'
import { CategorySection } from '../category-section'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useMarketMetrics, useMarketBadDebt } from '@/hooks/use-market-metrics'
import { formatBigInt, formatCurrency, formatPercentage } from '@/lib/utils'
import { getLLTVColor } from '@/lib/utils/risk-calculator'
import { getTextColor, getPercentageColor } from '@/lib/utils/styles'
import { isChainlinkOracle } from '@/lib/utils/oracle-utils'

interface SafetyTabProps {
  market: Market
}

export function SafetyTab({ market }: SafetyTabProps) {
  const { lltv } = useMarketMetrics(market)
  const { hasUnrealizedBadDebt, hasRealizedBadDebt } = useMarketBadDebt(market)
  
  const lltvColor = getLLTVColor(lltv)
  
  return (
    <div className="space-y-6">
      <SafetyIndicator market={market} showDetails />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="LLTV (Max LTV)"
          value={`${lltv.toFixed(2)}%`}
          metricKey="lltv"
          valueClassName={getTextColor(lltvColor)}
          description="Liquidation threshold"
        />
        
        {hasUnrealizedBadDebt && market.badDebt?.underlying && (
          <MetricCard
            title="Bad Debt (Unrealized)"
            value={formatBigInt(market.badDebt.underlying, market.loanAsset.decimals)}
            metricKey="badDebt"
            valueClassName="text-yellow-600 dark:text-yellow-400"
            badge={{ label: "Warning", variant: "outline" }}
            subtitle={market.badDebt.usd ? `~${formatCurrency(market.badDebt.usd)}` : undefined}
            description={`${market.loanAsset.symbol} underlying`}
          />
        )}
        
        {hasRealizedBadDebt && market.realizedBadDebt?.underlying && (
          <MetricCard
            title="Realized Bad Debt"
            value={formatBigInt(market.realizedBadDebt.underlying, market.loanAsset.decimals)}
            metricKey="realizedBadDebt"
            valueClassName="text-red-600 dark:text-red-400"
            badge={{ label: "Critical", variant: "destructive" }}
            subtitle={market.realizedBadDebt.usd ? `~${formatCurrency(market.realizedBadDebt.usd)}` : undefined}
            description={`${market.loanAsset.symbol} underlying`}
          />
        )}
        
        {market.oracle && (
          <MetricCard
            title="Oracle Type"
            value={market.oracle.type}
            metricKey="oracleType"
            valueClassName={
              isChainlinkOracle(market.oracle.type)
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }
            description="Price feed provider"
          />
        )}
        
        {market.state?.dailyPriceVariation !== undefined && market.state.dailyPriceVariation !== null && (
          <MetricCard
            title="24h Price Change"
            value={`${market.state.dailyPriceVariation > 0 ? '+' : ''}${formatPercentage(market.state.dailyPriceVariation)}`}
            metricKey="dailyPriceVariation"
            valueClassName={getTextColor(getPercentageColor(market.state.dailyPriceVariation))}
            description="Collateral volatility"
          />
        )}
      </div>
      
      {market.warnings && market.warnings.length > 0 && (
        <CategorySection 
          title="Market Warnings" 
          icon={AlertTriangle}
          accent="yellow"
        >
          <div className="space-y-2">
            {market.warnings.map((warning, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded-lg ${
                  warning.level === 'RED' 
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/20' 
                    : 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={warning.level === 'RED' ? 'destructive' : 'outline'}>
                    {warning.level}
                  </Badge>
                  <span className="font-medium">{warning.type}</span>
                </div>
              </div>
            ))}
          </div>
        </CategorySection>
      )}
    </div>
  )
}
