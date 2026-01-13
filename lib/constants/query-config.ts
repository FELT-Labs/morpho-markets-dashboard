/**
 * GraphQL query configuration and defaults
 */

export const QUERY_DEFAULTS = {
  MARKETS_PAGE_SIZE: 200,
  ASSETS_PAGE_SIZE: 1000,
  DEFAULT_ORDER_BY: 'SupplyAssetsUsd',
  DEFAULT_ORDER_DIRECTION: 'Desc',
} as const

export const CHAIN_CONFIG = {
  ETHEREUM: {
    id: 1,
    name: 'ethereum',
    label: 'Ethereum',
  },
  BASE: {
    id: 8453,
    name: 'base',
    label: 'Base',
  },
} as const
