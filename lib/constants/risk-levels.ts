/**
 * Risk assessment thresholds and configuration
 */

export const RISK_THRESHOLDS = {
  UTILIZATION_HIGH: 0.95,
  UTILIZATION_MEDIUM: 0.80,
  LLTV_HIGH: 90,
  LLTV_MEDIUM: 85,
} as const

export type RiskLevel = 'low' | 'medium' | 'high'

export interface RiskAssessment {
  level: RiskLevel
  label: string
  description: string
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
}
