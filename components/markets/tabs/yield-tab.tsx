/**
 * Yield & Returns tab component
 */

import { Market } from '@/types'
import { MetricCard } from '../metric-card'
import { CategorySection } from '../category-section'
import { TrendingUp } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'
import { useMarketMetrics } from '@/hooks/use-market-metrics'

interface YieldTabProps {
  market: Market
}

export function YieldTab({ market }: YieldTabProps) {
  const { netSupplyApy, netBorrowApy } = useMarketMetrics(market)
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Supply APY"
          value={formatPercentage(netSupplyApy)}
          metricKey="netSupplyApy"
          valueClassName="text-green-600 dark:text-green-400"
          subtitle={market.state?.supplyApy !== netSupplyApy && market.state?.supplyApy ? 
            `Base: ${formatPercentage(market.state.supplyApy)}` : undefined}
        />
        
        <MetricCard
          title="Net Borrow APY"
          value={formatPercentage(netBorrowApy)}
          metricKey="netBorrowApy"
          valueClassName="text-orange-600 dark:text-orange-400"
          subtitle={market.state?.borrowApy !== netBorrowApy && market.state?.borrowApy ? 
            `Base: ${formatPercentage(market.state.borrowApy)}` : undefined}
        />
        
        <MetricCard
          title="Supply APY"
          value={formatPercentage(market.state?.supplyApy)}
          metricKey="supplyApy"
          valueClassName="text-green-600 dark:text-green-400"
          description="Base lending rate"
        />
        
        <MetricCard
          title="Borrow APY"
          value={formatPercentage(market.state?.borrowApy)}
          metricKey="borrowApy"
          valueClassName="text-orange-600 dark:text-orange-400"
          description="Base borrowing rate"
        />
      </div>
      
      {market.state?.apyAtTarget !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="APY at Target"
            value={formatPercentage(market.state.apyAtTarget)}
            metricKey="apyAtTarget"
            valueClassName="text-purple-600 dark:text-purple-400"
            description="Expected rate at target utilization"
          />
          
          <MetricCard
            title="Fee Rate"
            value={formatPercentage(market.state.fee)}
            metricKey="feeRate"
            description="Protocol fee percentage"
          />
        </div>
      )}
      
      {(market.state?.avgSupplyApy || market.state?.dailySupplyApy || market.state?.weeklySupplyApy) && (
        <CategorySection title="Time-Averaged Rates" icon={TrendingUp} accent="green">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {market.state.avgSupplyApy !== undefined && (
              <MetricCard
                title="6h Avg Supply"
                value={formatPercentage(market.state.avgSupplyApy)}
                metricKey="avgSupplyApy"
                valueClassName="text-green-600 dark:text-green-400"
              />
            )}
            {market.state.avgBorrowApy !== undefined && (
              <MetricCard
                title="6h Avg Borrow"
                value={formatPercentage(market.state.avgBorrowApy)}
                metricKey="avgBorrowApy"
                valueClassName="text-orange-600 dark:text-orange-400"
              />
            )}
            {market.state.dailySupplyApy !== undefined && (
              <MetricCard
                title="Daily Avg Supply"
                value={formatPercentage(market.state.dailySupplyApy)}
                metricKey="dailySupplyApy"
                valueClassName="text-green-600 dark:text-green-400"
              />
            )}
            {market.state.weeklySupplyApy !== undefined && (
              <MetricCard
                title="Weekly Avg Supply"
                value={formatPercentage(market.state.weeklySupplyApy)}
                metricKey="weeklySupplyApy"
                valueClassName="text-green-600 dark:text-green-400"
              />
            )}
          </div>
        </CategorySection>
      )}
      
      {market.state?.rewards && market.state.rewards.length > 0 && (
        <CategorySection title="Rewards Programs" icon={TrendingUp} accent="purple">
          <div className="space-y-3">
            {market.state.rewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{reward.asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{reward.asset.name}</div>
                </div>
                <div className="text-right space-y-1">
                  {reward.supplyApr && reward.supplyApr > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Supply:</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{formatPercentage(reward.supplyApr)} APR
                      </span>
                    </div>
                  )}
                  {reward.borrowApr && reward.borrowApr > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Borrow:</span>
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        +{formatPercentage(reward.borrowApr)} APR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CategorySection>
      )}
    </div>
  )
}
