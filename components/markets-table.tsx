'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Market, MarketOrderBy, OrderDirection } from '@/types/market'
import { formatUSD, formatPercent } from '@/lib/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface MarketsTableProps {
  markets: Market[]
  chain: string
  loanAsset: string
}

const FIELD_TO_ORDER_BY: Record<string, MarketOrderBy> = {
  collateral: 'CollateralAssetSymbol',
  supply: 'SupplyAssetsUsd',
  borrow: 'BorrowAssetsUsd',
  utilization: 'Utilization',
  apy: 'SupplyApy',
}

const ORDER_BY_TO_FIELD: Record<MarketOrderBy, string> = {
  CollateralAssetSymbol: 'collateral',
  SupplyAssetsUsd: 'supply',
  BorrowAssetsUsd: 'borrow',
  Utilization: 'utilization',
  SupplyApy: 'apy',
}

export function MarketsTable({ markets, chain, loanAsset }: MarketsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentOrderBy = searchParams.get('orderBy') as MarketOrderBy | null
  const currentDirection = searchParams.get('orderDirection') as OrderDirection | null
  
  const currentField = currentOrderBy ? ORDER_BY_TO_FIELD[currentOrderBy] : null

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const orderBy = FIELD_TO_ORDER_BY[field]
    
    // If clicking the same field, toggle direction: Desc → Asc → None
    if (currentField === field) {
      if (currentDirection === 'Desc') {
        params.set('orderDirection', 'Asc')
      } else if (currentDirection === 'Asc') {
        // Remove sorting
        params.delete('orderBy')
        params.delete('orderDirection')
      } else {
        // This shouldn't happen, but just in case
        params.set('orderBy', orderBy)
        params.set('orderDirection', 'Desc')
      }
    } else {
      // New field - start with Desc (most common for numeric values)
      params.set('orderBy', orderBy)
      params.set('orderDirection', 'Desc')
    }
    
    router.push(`/${chain}/${loanAsset}?${params.toString()}`)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (currentField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    if (currentDirection === 'Asc') {
      return <ArrowUp className="h-4 w-4" />
    }
    if (currentDirection === 'Desc') {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUpDown className="h-4 w-4" />
  }

  const handleRowClick = (uniqueKey: string) => {
    router.push(`/${chain}/${loanAsset}/${uniqueKey}`)
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('collateral')}
                className="flex items-center gap-2 hover:text-foreground"
              >
                Collateral Asset
                <SortIcon field="collateral" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('supply')}
                className="flex items-center gap-2 hover:text-foreground"
              >
                Total Supply
                <SortIcon field="supply" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('borrow')}
                className="flex items-center gap-2 hover:text-foreground"
              >
                Total Borrow
                <SortIcon field="borrow" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('utilization')}
                className="flex items-center gap-2 hover:text-foreground"
              >
                Utilization
                <SortIcon field="utilization" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('apy')}
                className="flex items-center gap-2 hover:text-foreground"
              >
                Supply APY
                <SortIcon field="apy" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {markets.map((market) => (
            <TableRow
              key={market.uniqueKey}
              onClick={() => handleRowClick(market.uniqueKey)}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">
                    {market.collateralAsset?.symbol || 'Unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {market.collateralAsset?.name || '-'}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatUSD(market.state.supplyAssetsUsd, true)}</TableCell>
              <TableCell>{formatUSD(market.state.borrowAssetsUsd, true)}</TableCell>
              <TableCell>{formatPercent(market.state.utilization)}</TableCell>
              <TableCell className="text-green-600">
                {formatPercent(market.state.supplyApy)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {markets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No markets found
        </div>
      )}
    </div>
  )
}
