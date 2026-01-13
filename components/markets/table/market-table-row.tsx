/**
 * Markets table row component
 */

import Link from "next/link"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Market } from "@/types"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { SafetyIndicator } from "../safety-indicator"
import { OracleHealthBadge } from "../oracle-health-badge"
import { useMarketMetrics } from "@/hooks/use-market-metrics"
import { getUtilizationColor } from "@/lib/utils/risk-calculator"
import { getTextColor } from "@/lib/utils/styles"

interface MarketTableRowProps {
  market: Market
  chain: string
  loanAsset: string
}

export function MarketTableRow({ market, chain, loanAsset }: MarketTableRowProps) {
  const {
    netSupplyApy,
    netBorrowApy,
    hasSupplyRewards,
    hasBorrowRewards,
    hasOracleWarning,
  } = useMarketMetrics(market)
  
  const marketUrl = `/${chain}/${loanAsset}/${market.uniqueKey}`
  const utilization = market.state?.utilization || 0
  const utilizationColor = getUtilizationColor(utilization)
  
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      {/* Market Info */}
      <TableCell>
        <Link href={marketUrl} className="block">
          <div className="font-medium">
            {market.loanAsset.symbol}
            {market.collateralAsset && (
              <span className="text-muted-foreground"> / {market.collateralAsset.symbol}</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {market.loanAsset.name}
          </div>
        </Link>
      </TableCell>
      
      <TableCell>
        <Link href={marketUrl} className="block">
          <Badge variant="outline">{market.morphoBlue.chain.network}</Badge>
        </Link>
      </TableCell>
      
      {/* Safety Category */}
      <TableCell className="border-l">
        <Link href={marketUrl} className="flex justify-center">
          <SafetyIndicator market={market} showDetails={false} />
        </Link>
      </TableCell>
      
      {/* Yield Category */}
      <TableCell className="text-right border-l">
        <Link href={marketUrl} className="block">
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
        <Link href={marketUrl} className="block">
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
      
      {/* Liquidity Category */}
      <TableCell className="text-right border-l">
        <Link 
          href={marketUrl}
          className="block text-blue-600 dark:text-blue-400 font-medium"
        >
          {formatCurrency(market.state?.liquidityAssetsUsd)}
        </Link>
      </TableCell>
      
      <TableCell className="text-right">
        <Link href={marketUrl} className="block">
          <span className={getTextColor(utilizationColor) + " font-medium"}>
            {formatPercentage(utilization)}
          </span>
        </Link>
      </TableCell>
      
      {/* Oracle Category */}
      <TableCell className="border-l">
        <Link href={marketUrl} className="flex justify-center">
          <OracleHealthBadge 
            oracleType={market.oracle?.type}
            hasOracleWarning={hasOracleWarning}
            compact
          />
        </Link>
      </TableCell>
    </TableRow>
  )
}
