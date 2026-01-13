/**
 * Risk assessment and calculation utilities
 */

import { Market } from '@/types'
import { RISK_THRESHOLDS, RiskLevel, RISK_LABELS } from '@/lib/constants/risk-levels'
import { COLORS, ColorScheme } from '@/lib/constants/colors'
import { ShieldCheck, Shield, ShieldAlert, LucideIcon } from 'lucide-react'

export interface RiskAnalysis {
  level: RiskLevel
  label: string
  color: ColorScheme
  icon: LucideIcon
  lltv: number
  utilization: number
  hasWarnings: boolean
  hasBadDebt: boolean
  reasons: string[]
}

/**
 * Calculate comprehensive risk analysis for a market
 */
export function calculateMarketRisk(market: Market): RiskAnalysis {
  const lltv = (parseInt(market.lltv) / 1e18) * 100
  const utilization = market.state?.utilization || 0
  const hasWarnings = Boolean(market.warnings && market.warnings.length > 0)
  const hasBadDebt = Boolean(
    (market.badDebt?.usd && market.badDebt.usd > 0) ||
    (market.realizedBadDebt?.usd && market.realizedBadDebt.usd > 0)
  )

  const reasons: string[] = []
  let level: RiskLevel = 'low'

  // High risk conditions
  if (hasWarnings) {
    reasons.push('Active market warnings')
    level = 'high'
  }
  if (hasBadDebt) {
    reasons.push('Bad debt detected')
    level = 'high'
  }
  if (utilization > RISK_THRESHOLDS.UTILIZATION_HIGH) {
    reasons.push(`High utilization (>${(RISK_THRESHOLDS.UTILIZATION_HIGH * 100).toFixed(0)}%)`)
    level = 'high'
  }
  if (lltv > RISK_THRESHOLDS.LLTV_HIGH) {
    reasons.push(`High LLTV (>${RISK_THRESHOLDS.LLTV_HIGH}%)`)
    level = 'high'
  }

  // Medium risk conditions (only if not already high)
  if (level === 'low') {
    if (utilization > RISK_THRESHOLDS.UTILIZATION_MEDIUM) {
      reasons.push(`Elevated utilization (>${(RISK_THRESHOLDS.UTILIZATION_MEDIUM * 100).toFixed(0)}%)`)
      level = 'medium'
    }
    if (lltv > RISK_THRESHOLDS.LLTV_MEDIUM) {
      reasons.push(`Elevated LLTV (>${RISK_THRESHOLDS.LLTV_MEDIUM}%)`)
      level = 'medium'
    }
  }

  const color: ColorScheme = level === 'high' ? 'red' : level === 'medium' ? 'yellow' : 'green'
  const icon = level === 'high' ? ShieldAlert : level === 'medium' ? Shield : ShieldCheck

  return {
    level,
    label: RISK_LABELS[level],
    color,
    icon,
    lltv,
    utilization,
    hasWarnings,
    hasBadDebt,
    reasons,
  }
}

/**
 * Get color classes for a risk level
 */
export function getRiskColorClasses(level: RiskLevel) {
  const colorScheme: ColorScheme = level === 'high' ? 'red' : level === 'medium' ? 'yellow' : 'green'
  return COLORS[colorScheme]
}

/**
 * Get utilization-based color scheme
 */
export function getUtilizationColor(utilization: number): ColorScheme {
  if (utilization > RISK_THRESHOLDS.UTILIZATION_HIGH) return 'red'
  if (utilization > RISK_THRESHOLDS.UTILIZATION_MEDIUM) return 'yellow'
  return 'green'
}

/**
 * Get LLTV-based color scheme
 */
export function getLLTVColor(lltv: number): ColorScheme {
  if (lltv > RISK_THRESHOLDS.LLTV_HIGH) return 'red'
  if (lltv > RISK_THRESHOLDS.LLTV_MEDIUM) return 'yellow'
  return 'green'
}
