"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { MetricTooltip } from "./metric-tooltip"
import type { Market } from "@/types"

type SortField = "netSupplyApy" | "supplyApy" | "netBorrowApy" | "borrowApy" | "supplyAssetsUsd" | "borrowAssetsUsd" | "liquidityAssetsUsd" | "utilization"
type SortDirection = "asc" | "desc"

interface MarketsTableProps {
  markets: Market[]
  chain: string
  loanAsset: string
}

interface SortIconProps {
  field: SortField
  currentField: SortField
  direction: SortDirection
}

function SortIcon({ field, currentField, direction }: SortIconProps) {
  if (currentField !== field) {
    return <ArrowUpDown className="ml-2 h-4 w-4 inline" />
  }
  return direction === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4 inline" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4 inline" />
  )
}

export function MarketsTable({ markets, chain, loanAsset }: MarketsTableProps) {
  const [sortField, setSortField] = useState<SortField>("supplyAssetsUsd")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const sortedMarkets = useMemo(() => {
    const sorted = [...markets].sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case "netSupplyApy":
          aValue = a.state?.netSupplyApy || a.state?.supplyApy || 0
          bValue = b.state?.netSupplyApy || b.state?.supplyApy || 0
          break
        case "supplyApy":
          aValue = a.state?.supplyApy || 0
          bValue = b.state?.supplyApy || 0
          break
        case "netBorrowApy":
          aValue = a.state?.netBorrowApy || a.state?.borrowApy || 0
          bValue = b.state?.netBorrowApy || b.state?.borrowApy || 0
          break
        case "borrowApy":
          aValue = a.state?.borrowApy || 0
          bValue = b.state?.borrowApy || 0
          break
        case "supplyAssetsUsd":
          aValue = a.state?.supplyAssetsUsd || 0
          bValue = b.state?.supplyAssetsUsd || 0
          break
        case "borrowAssetsUsd":
          aValue = a.state?.borrowAssetsUsd || 0
          bValue = b.state?.borrowAssetsUsd || 0
          break
        case "liquidityAssetsUsd":
          aValue = a.state?.liquidityAssetsUsd || 0
          bValue = b.state?.liquidityAssetsUsd || 0
          break
        case "utilization":
          aValue = a.state?.utilization || 0
          bValue = b.state?.utilization || 0
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return sorted
  }, [markets, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

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
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netSupplyApy")}
            >
              <div className="flex items-center justify-end gap-1">
                Net Supply APY
                <MetricTooltip metricKey="netSupplyApy" />
                <SortIcon field="netSupplyApy" currentField={sortField} direction={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netBorrowApy")}
            >
              <div className="flex items-center justify-end gap-1">
                Net Borrow APY
                <MetricTooltip metricKey="netBorrowApy" />
                <SortIcon field="netBorrowApy" currentField={sortField} direction={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("supplyAssetsUsd")}
            >
              <div className="flex items-center justify-end gap-1">
                Total Supply
                <MetricTooltip metricKey="totalSupply" />
                <SortIcon field="supplyAssetsUsd" currentField={sortField} direction={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("liquidityAssetsUsd")}
            >
              <div className="flex items-center justify-end gap-1">
                Available Liquidity
                <MetricTooltip metricKey="availableLiquidity" />
                <SortIcon field="liquidityAssetsUsd" currentField={sortField} direction={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("utilization")}
            >
              <div className="flex items-center justify-end gap-1">
                Utilization
                <MetricTooltip metricKey="utilization" />
                <SortIcon field="utilization" currentField={sortField} direction={sortDirection} />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMarkets.map((market) => {
            const marketUrl = `/${chain}/${loanAsset}/${market.uniqueKey}`
            const hasSupplyRewards = market.state?.rewards?.some(r => r.supplyApr && r.supplyApr > 0)
            const hasBorrowRewards = market.state?.rewards?.some(r => r.borrowApr && r.borrowApr > 0)
            const netSupplyApy = market.state?.netSupplyApy || market.state?.supplyApy
            const netBorrowApy = market.state?.netBorrowApy || market.state?.borrowApy
            
            return (
              <TableRow 
                key={market.id} 
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    <div className="font-medium">
                      {market.loanAsset.symbol}
                      {market.collateralAsset && (
                        <span className="text-muted-foreground"> / {market.collateralAsset.symbol}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {market.loanAsset.name}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    <Badge variant="outline">{market.morphoBlue.chain.network}</Badge>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatPercentage(netSupplyApy)}
                        </span>
                        {hasSupplyRewards && (
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            +
                          </Badge>
                        )}
                      </div>
                      {market.state?.supplyApy !== netSupplyApy && market.state?.supplyApy && (
                        <span className="text-xs text-muted-foreground">
                          Base: {formatPercentage(market.state.supplyApy)}
                        </span>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {formatPercentage(netBorrowApy)}
                        </span>
                        {hasBorrowRewards && (
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            +
                          </Badge>
                        )}
                      </div>
                      {market.state?.borrowApy !== netBorrowApy && market.state?.borrowApy && (
                        <span className="text-xs text-muted-foreground">
                          Base: {formatPercentage(market.state.borrowApy)}
                        </span>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    {formatCurrency(market.state?.supplyAssetsUsd)}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={marketUrl}
                    className="block text-blue-600 dark:text-blue-400"
                  >
                    {formatCurrency(market.state?.liquidityAssetsUsd)}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={marketUrl}
                    className="block"
                  >
                    <span className={
                      (market.state?.utilization || 0) > 0.95 ? "text-red-600 dark:text-red-400" :
                      (market.state?.utilization || 0) > 0.80 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-green-600 dark:text-green-400"
                    }>
                      {formatPercentage(market.state?.utilization)}
                    </span>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
