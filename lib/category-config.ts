import { 
  Shield, 
  Droplets, 
  TrendingUp, 
  Database, 
  Settings, 
  Activity 
} from "lucide-react"
import type { DataCategory, CategoryConfig } from "@/types"

export const CATEGORY_CONFIGS: Record<DataCategory, CategoryConfig> = {
  safety: {
    id: 'safety',
    label: 'Safety & Risk',
    description: 'Risk indicators, LLTV, bad debt, and market warnings',
    icon: 'Shield',
    color: 'red'
  },
  liquidity: {
    id: 'liquidity',
    label: 'Liquidity & Capacity',
    description: 'Available capital, market depth, and utilization',
    icon: 'Droplets',
    color: 'blue'
  },
  yield: {
    id: 'yield',
    label: 'Yield & Returns',
    description: 'APY/APR metrics for lenders and borrowers',
    icon: 'TrendingUp',
    color: 'green'
  },
  oracle: {
    id: 'oracle',
    label: 'Oracle Health',
    description: 'Oracle configuration and reliability indicators',
    icon: 'Database',
    color: 'purple'
  },
  configuration: {
    id: 'configuration',
    label: 'Market Configuration',
    description: 'Immutable market parameters and settings',
    icon: 'Settings',
    color: 'orange'
  },
  activity: {
    id: 'activity',
    label: 'Activity & Shares',
    description: 'Market participation and share-based metrics',
    icon: 'Activity',
    color: 'yellow'
  }
}

export const CATEGORY_ICONS = {
  Shield,
  Droplets,
  TrendingUp,
  Database,
  Settings,
  Activity
}

export function getCategoryConfig(category: DataCategory): CategoryConfig {
  return CATEGORY_CONFIGS[category]
}

export function getCategoryIcon(iconName: string) {
  return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS]
}

export function getCategoryColor(category: DataCategory): string {
  return CATEGORY_CONFIGS[category].color
}

export function getCategoryAccentClass(category: DataCategory): string {
  const color = getCategoryColor(category)
  return `border-l-${color}-500`
}
