/**
 * Custom hook for market risk assessment
 */

import { useMemo } from 'react'
import { Market } from '@/types'
import { calculateMarketRisk, RiskAnalysis } from '@/lib/utils/risk-calculator'
import { COLORS } from '@/lib/constants/colors'

export interface UseMarketRiskReturn extends RiskAnalysis {
  colorClasses: {
    text: string
    bg: string
    border: string
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

/**
 * Hook to calculate and return market risk analysis with styling
 */
export function useMarketRisk(market: Market): UseMarketRiskReturn {
  return useMemo(() => {
    const analysis = calculateMarketRisk(market)
    const colorClasses = COLORS[analysis.color]
    
    return {
      ...analysis,
      colorClasses,
    }
  }, [market])
}
