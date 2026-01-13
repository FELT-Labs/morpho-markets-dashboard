/**
 * Custom hook for calculating derived market metrics
 */

import { useMemo } from 'react'
import { Market } from '@/types'

export interface MarketMetrics {
  netSupplyApy: number | null | undefined
  netBorrowApy: number | null | undefined
  hasSupplyRewards: boolean
  hasBorrowRewards: boolean
  hasOracleWarning: boolean
  lltv: number
  targetBorrowUtilization: number | null
  targetWithdrawUtilization: number | null
}

/**
 * Hook to calculate derived metrics from market data
 */
export function useMarketMetrics(market: Market): MarketMetrics {
  return useMemo(() => {
    const netSupplyApy = market.state?.netSupplyApy || market.state?.supplyApy
    const netBorrowApy = market.state?.netBorrowApy || market.state?.borrowApy
    
    const hasSupplyRewards = Boolean(
      market.state?.rewards?.some(r => r.supplyApr && r.supplyApr > 0)
    )
    
    const hasBorrowRewards = Boolean(
      market.state?.rewards?.some(r => r.borrowApr && r.borrowApr > 0)
    )
    
    const hasOracleWarning = Boolean(
      market.warnings?.some(w => w.type.toLowerCase().includes('oracle'))
    )
    
    const lltv = (parseInt(market.lltv) / 1e18) * 100
    
    const targetBorrowUtilization = market.targetBorrowUtilization
      ? (parseInt(market.targetBorrowUtilization) / 1e18) * 100
      : null
    
    const targetWithdrawUtilization = market.targetWithdrawUtilization
      ? (parseInt(market.targetWithdrawUtilization) / 1e18) * 100
      : null
    
    return {
      netSupplyApy,
      netBorrowApy,
      hasSupplyRewards,
      hasBorrowRewards,
      hasOracleWarning,
      lltv,
      targetBorrowUtilization,
      targetWithdrawUtilization,
    }
  }, [market])
}

/**
 * Hook to check if market has bad debt
 */
export function useMarketBadDebt(market: Market) {
  return useMemo(() => {
    const hasBadDebt = Boolean(
      (market.badDebt?.usd && market.badDebt.usd > 0) ||
      (market.realizedBadDebt?.usd && market.realizedBadDebt.usd > 0)
    )
    
    const hasUnrealizedBadDebt = Boolean(
      market.badDebt?.underlying &&
      market.badDebt.underlying !== '0' &&
      BigInt(market.badDebt.underlying) > BigInt(0)
    )
    
    const hasRealizedBadDebt = Boolean(
      market.realizedBadDebt?.underlying &&
      market.realizedBadDebt.underlying !== '0' &&
      BigInt(market.realizedBadDebt.underlying) > BigInt(0)
    )
    
    return {
      hasBadDebt,
      hasUnrealizedBadDebt,
      hasRealizedBadDebt,
    }
  }, [market])
}
