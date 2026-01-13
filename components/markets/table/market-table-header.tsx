/**
 * Markets table header component
 */

import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MetricTooltip } from "../metric-tooltip"
import { SortIcon } from "./sort-icon"
import { SortDirection } from "@/hooks/use-table-sort"

export type MarketSortField = 
  | "netSupplyApy" 
  | "supplyApy" 
  | "netBorrowApy" 
  | "borrowApy" 
  | "supplyAssetsUsd" 
  | "borrowAssetsUsd" 
  | "liquidityAssetsUsd" 
  | "utilization"

interface MarketTableHeaderProps {
  sortField: MarketSortField
  sortDirection: SortDirection
  onSort: (field: MarketSortField) => void
}

export function MarketTableHeader({ 
  sortField, 
  sortDirection, 
  onSort 
}: MarketTableHeaderProps) {
  return (
    <TableHeader>
      {/* Category Group Headers */}
      <TableRow className="bg-muted/50">
        <TableHead colSpan={2} className="font-semibold">Market</TableHead>
        <TableHead className="font-semibold text-center border-l">Safety</TableHead>
        <TableHead colSpan={2} className="font-semibold text-center border-l">Yield</TableHead>
        <TableHead colSpan={2} className="font-semibold text-center border-l">Liquidity</TableHead>
        <TableHead className="font-semibold text-center border-l">Oracle</TableHead>
      </TableRow>
      
      {/* Column Headers */}
      <TableRow>
        <TableHead>Asset</TableHead>
        <TableHead>Chain</TableHead>
        <TableHead className="text-center border-l">
          <div className="flex items-center justify-center gap-1">
            Risk
            <MetricTooltip metricKey="lltv" />
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-muted/50 border-l"
          onClick={() => onSort("netSupplyApy")}
        >
          <div className="flex items-center justify-end gap-1">
            Supply APY
            <MetricTooltip metricKey="netSupplyApy" />
            <SortIcon isActive={sortField === "netSupplyApy"} direction={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-muted/50"
          onClick={() => onSort("netBorrowApy")}
        >
          <div className="flex items-center justify-end gap-1">
            Borrow APY
            <MetricTooltip metricKey="netBorrowApy" />
            <SortIcon isActive={sortField === "netBorrowApy"} direction={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-muted/50 border-l"
          onClick={() => onSort("liquidityAssetsUsd")}
        >
          <div className="flex items-center justify-end gap-1">
            Available
            <MetricTooltip metricKey="availableLiquidity" />
            <SortIcon isActive={sortField === "liquidityAssetsUsd"} direction={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="text-right cursor-pointer hover:bg-muted/50"
          onClick={() => onSort("utilization")}
        >
          <div className="flex items-center justify-end gap-1">
            Utilization
            <MetricTooltip metricKey="utilization" />
            <SortIcon isActive={sortField === "utilization"} direction={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="text-center border-l">
          Type
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
