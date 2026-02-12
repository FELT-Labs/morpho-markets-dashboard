import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPercent } from "@/lib/utils/format"
import { PortfolioItem } from "@/types/portfolio"

interface PortfolioAllocationTableProps {
  title: string
  titleColorClass?: string
  items: PortfolioItem[]
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  barColorClass?: string
  emptyMessage?: string
}

export function PortfolioAllocationTable({ 
  title, 
  items, 
  badgeText, 
  badgeVariant = "secondary",
  barColorClass = "bg-blue-600",
  emptyMessage = "No allocation data available."
}: PortfolioAllocationTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold white`}>{title}</h2>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Market</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">APY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.uniqueKey}>
                  <TableCell>
                    <div className="font-semibold">
                      {item.market ? (
                        <span>
                          {item.market.collateralAsset?.symbol || 'Unknown'} / {item.market.loanAsset.symbol}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Unknown Market</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5" title={item.uniqueKey}>
                      {item.uniqueKey.substring(0, 6)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm w-12">{formatPercent(item.weight)}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${barColorClass}`} 
                          style={{ width: `${item.weight * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-600">
                    {item.meanApy !== undefined ? formatPercent(item.meanApy) : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
