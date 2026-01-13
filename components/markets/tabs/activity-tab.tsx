/**
 * Activity & Shares tab component
 */

import { Market } from '@/types'
import { MetricCard } from '../metric-card'
import { formatTimestampFull } from '@/lib/utils'

interface ActivityTabProps {
  market: Market
}

export function ActivityTab({ market }: ActivityTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Supply Shares"
        value={market.state?.supplyShares || '0'}
        metricKey="supplyShares"
        description="Share-based supply tracking"
      />
      
      <MetricCard
        title="Borrow Shares"
        value={market.state?.borrowShares || '0'}
        metricKey="borrowShares"
        description="Share-based borrow tracking"
      />
      
      {market.state?.blockNumber && (
        <MetricCard
          title="Last Update Block"
          value={market.state.blockNumber}
          metricKey="blockNumber"
          description="Latest state update"
        />
      )}
      
      {market.state?.timestamp && (
        <MetricCard
          title="Last Update"
          value={formatTimestampFull(market.state.timestamp)}
          metricKey="timestamp"
          description="Last state update time"
        />
      )}
    </div>
  )
}
