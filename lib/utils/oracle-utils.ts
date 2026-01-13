/**
 * Oracle-related utility functions
 */

import { OracleType, Oracle } from '@/types'

/**
 * Check if oracle is a Chainlink oracle (any version)
 */
export function isChainlinkOracle(oracleType?: OracleType): boolean {
  if (!oracleType) return false
  return (
    oracleType === OracleType.ChainlinkOracle ||
    oracleType === OracleType.ChainlinkOracleV2
  )
}

/**
 * Get human-readable label for oracle type
 */
export function getOracleLabel(oracleType: OracleType, compact = false): string {
  switch (oracleType) {
    case OracleType.ChainlinkOracle:
      return compact ? 'Chainlink' : 'Chainlink Oracle'
    case OracleType.ChainlinkOracleV2:
      return compact ? 'Chainlink V2' : 'Chainlink Oracle V2'
    case OracleType.CustomOracle:
      return 'Custom Oracle'
    case OracleType.Unknown:
      return 'Unknown'
    default:
      return oracleType
  }
}

/**
 * Determine oracle health status
 */
export function getOracleHealthStatus(
  oracleType?: OracleType,
  hasOracleWarning = false
): 'healthy' | 'warning' | 'unknown' {
  if (!oracleType) return 'unknown'
  if (hasOracleWarning) return 'warning'
  if (isChainlinkOracle(oracleType)) return 'healthy'
  if (oracleType === OracleType.Unknown || oracleType === OracleType.CustomOracle) {
    return 'unknown'
  }
  return 'healthy'
}

/**
 * Get oracle description based on status
 */
export function getOracleDescription(
  oracleType?: OracleType,
  hasOracleWarning = false
): string {
  const status = getOracleHealthStatus(oracleType, hasOracleWarning)
  
  switch (status) {
    case 'healthy':
      return 'Oracle is configured'
    case 'warning':
      return 'Oracle configuration warning'
    case 'unknown':
      return 'Custom or unknown oracle type'
    default:
      return 'Oracle status unknown'
  }
}

/**
 * Check if oracle has feed data
 */
export function hasOracleFeeds(oracle?: Oracle | null): boolean {
  if (!oracle?.data) return false
  
  return Boolean(
    ('baseFeedOne' in oracle.data && oracle.data.baseFeedOne) ||
    ('quoteFeedOne' in oracle.data && oracle.data.quoteFeedOne)
  )
}
