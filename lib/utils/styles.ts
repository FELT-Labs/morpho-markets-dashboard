/**
 * Style utility functions for consistent styling
 */

import { COLORS, ColorScheme, CATEGORY_BORDER_CLASSES } from '@/lib/constants/colors'
import { DataCategory } from '@/types'

/**
 * Get color classes for a given color scheme
 */
export function getColorClasses(color: ColorScheme) {
  return COLORS[color]
}

/**
 * Get text color class for a color scheme
 */
export function getTextColor(color: ColorScheme): string {
  return COLORS[color].text
}

/**
 * Get background color class for a color scheme
 */
export function getBgColor(color: ColorScheme): string {
  return COLORS[color].bg
}

/**
 * Get border color class for a color scheme
 */
export function getBorderColor(color: ColorScheme): string {
  return COLORS[color].border
}

/**
 * Get badge variant for a color scheme
 */
export function getBadgeVariant(color: ColorScheme) {
  return COLORS[color].badgeVariant
}

/**
 * Get full color class set (text, bg, border)
 */
export function getFullColorClasses(color: ColorScheme): string {
  const colors = COLORS[color]
  return `${colors.text} ${colors.bg} ${colors.border}`
}

/**
 * Get category accent border class
 */
export function getCategoryBorderClass(category: DataCategory): string {
  const colorMap: Record<DataCategory, string> = {
    safety: 'red',
    liquidity: 'blue',
    yield: 'green',
    oracle: 'purple',
    configuration: 'orange',
    activity: 'yellow',
  }
  
  const color = colorMap[category]
  return CATEGORY_BORDER_CLASSES[color] || ''
}

/**
 * Get APY/percentage color based on value (green for positive, red for negative)
 */
export function getPercentageColor(value: number | null | undefined, invert = false): ColorScheme {
  if (value === null || value === undefined) return 'gray'
  
  if (invert) {
    return value > 0 ? 'red' : value < 0 ? 'green' : 'gray'
  }
  
  return value > 0 ? 'green' : value < 0 ? 'red' : 'gray'
}

/**
 * Get supply APY color (always green for positive rates)
 */
export function getSupplyApyColor(): ColorScheme {
  return 'green'
}

/**
 * Get borrow APY color (always orange/red for costs)
 */
export function getBorrowApyColor(): ColorScheme {
  return 'orange'
}

/**
 * Get liquidity color
 */
export function getLiquidityColor(): ColorScheme {
  return 'blue'
}
