/**
 * Centralized color classes for consistent styling across the app
 */

export type ColorScheme = 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'

export interface ColorClasses {
  text: string
  bg: string
  border: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export const COLORS: Record<ColorScheme, ColorClasses> = {
  green: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    badgeVariant: 'secondary',
  },
  yellow: {
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badgeVariant: 'outline',
  },
  red: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    badgeVariant: 'destructive',
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    badgeVariant: 'secondary',
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    badgeVariant: 'outline',
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    badgeVariant: 'secondary',
  },
  gray: {
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    badgeVariant: 'outline',
  },
}

export const CATEGORY_BORDER_CLASSES: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  orange: 'border-l-orange-500',
  purple: 'border-l-purple-500',
  red: 'border-l-red-500',
  yellow: 'border-l-yellow-500',
}
