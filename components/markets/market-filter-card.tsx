import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MarketFilterCardProps {
  chain: string
  chainLabel: string
  loanAsset: string
  totalMarkets?: number
  totalTVL?: number
}

export function MarketFilterCard({
  chain,
  chainLabel,
  loanAsset,
  totalMarkets,
  totalTVL,
}: MarketFilterCardProps) {
  return (
    <Link href={`/${chain}/${loanAsset}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {loanAsset}
            </CardTitle>
            <Badge variant="outline">{chainLabel}</Badge>
          </div>
          <CardDescription>
            Browse {loanAsset} lending markets on {chainLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {totalMarkets !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Markets</span>
                <span className="font-medium">{totalMarkets}</span>
              </div>
            )}
            {totalTVL !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Value Locked</span>
                <span className="font-medium">{formatCurrency(totalTVL)}</span>
              </div>
            )}
            <div className="flex items-center justify-end text-sm text-primary mt-4 group-hover:translate-x-1 transition-transform">
              View Markets
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
