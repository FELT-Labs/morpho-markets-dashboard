/**
 * Markets table component - refactored with extracted components and hooks
 */

"use client"

import { useCallback } from "react"
import { Table, TableBody } from "@/components/ui/table"
import { Market } from "@/types"
import { useSortableTable } from "@/hooks/use-table-sort"
import { MarketTableHeader, MarketSortField } from "./table/market-table-header"
import { MarketTableRow } from "./table/market-table-row"

interface MarketsTableProps {
  markets: Market[]
  chain: string
  loanAsset: string
}

export function MarketsTable({ markets, chain, loanAsset }: MarketsTableProps) {
  const getSortValue = useCallback((market: Market, field: MarketSortField): number => {
    switch (field) {
      case "netSupplyApy":
        return market.state?.netSupplyApy || market.state?.supplyApy || 0
      case "supplyApy":
        return market.state?.supplyApy || 0
      case "netBorrowApy":
        return market.state?.netBorrowApy || market.state?.borrowApy || 0
      case "borrowApy":
        return market.state?.borrowApy || 0
      case "supplyAssetsUsd":
        return market.state?.supplyAssetsUsd || 0
      case "borrowAssetsUsd":
        return market.state?.borrowAssetsUsd || 0
      case "liquidityAssetsUsd":
        return market.state?.liquidityAssetsUsd || 0
      case "utilization":
        return market.state?.utilization || 0
      default:
        return 0
    }
  }, [])

  const {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableTable<Market, MarketSortField>({
    data: markets,
    initialSortField: "supplyAssetsUsd",
    initialSortDirection: "desc",
    getSortValue,
  })

  if (markets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No markets found.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <MarketTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableBody>
          {sortedData.map((market) => (
            <MarketTableRow
              key={market.id}
              market={market}
              chain={chain}
              loanAsset={loanAsset}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
