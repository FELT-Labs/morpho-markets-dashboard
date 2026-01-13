/**
 * Liquidity & Capacity tab component
 */

import { Market } from '@/types'
import { MetricCard } from '../metric-card'
import { formatCurrency } from '@/lib/utils'
import { useMarketMetrics } from '@/hooks/use-market-metrics'

interface LiquidityTabProps {
  market: Market
}

export function LiquidityTab({ market }: LiquidityTabProps) {
  const { targetBorrowUtilization, targetWithdrawUtilization } = useMarketMetrics(market)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        title="Available Liquidity"
        value={formatCurrency(market.state?.liquidityAssetsUsd)}
        metricKey="availableLiquidity"
        valueClassName="text-blue-600 dark:text-blue-400"
        subtitle={`${market.loanAsset.symbol} available to borrow`}
      />
      
      <MetricCard
        title="Total Liquidity"
        value={formatCurrency(market.state?.totalLiquidityUsd)}
        metricKey="totalLiquidity"
        valueClassName="text-blue-600 dark:text-blue-400"
        subtitle="Combined available capital"
      />
      
      <MetricCard
        title="Total Supply"
        value={formatCurrency(market.state?.supplyAssetsUsd)}
        metricKey="totalSupply"
        subtitle={`${market.loanAsset.symbol} supplied`}
      />
      
      <MetricCard
        title="Total Borrow"
        value={formatCurrency(market.state?.borrowAssetsUsd)}
        metricKey="totalBorrow"
        subtitle={`${market.loanAsset.symbol} borrowed`}
      />
      
      {market.state?.collateralAssetsUsd && (
        <MetricCard
          title="Total Collateral"
          value={formatCurrency(market.state.collateralAssetsUsd)}
          metricKey="collateralAssets"
          subtitle={market.collateralAsset ? `${market.collateralAsset.symbol} locked` : undefined}
        />
      )}
      
      {market.reallocatableLiquidityAssets && (
        <MetricCard
          title="Reallocatable Liquidity"
          value={market.reallocatableLiquidityAssets}
          metricKey="reallocatableLiquidity"
          subtitle="Via Public Allocator"
          description="Capital that can be moved by Public Allocator"
        />
      )}
      
      {targetBorrowUtilization !== null && (
        <MetricCard
          title="Target Borrow Util"
          value={`${targetBorrowUtilization.toFixed(2)}%`}
          metricKey="targetBorrowUtilization"
          description="Optimal borrow utilization"
        />
      )}
      
      {targetWithdrawUtilization !== null && (
        <MetricCard
          title="Target Withdraw Util"
          value={`${targetWithdrawUtilization.toFixed(2)}%`}
          metricKey="targetWithdrawUtilization"
          description="Optimal withdraw utilization"
        />
      )}
    </div>
  )
}
