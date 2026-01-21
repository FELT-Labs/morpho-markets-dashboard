import { getMarketByKey } from '@/lib/services/market-service'
import { formatUSD, formatPercent, formatBigInt } from '@/lib/utils/format'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollateralTab } from '@/components/markets/tabs/collateral-tab'
import { YieldTab } from '@/components/markets/tabs/yield-tab'
import { LiquidityTab } from '@/components/markets/tabs/liquidity-tab'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ chain: string; loanAsset: string; uniqueKey: string }>
}) {
  const { chain, loanAsset, uniqueKey } = await params
  const market = await getMarketByKey(uniqueKey, chain)

  const ltv = formatPercent(formatBigInt(market.lltv, 18))
  const chainId = chain === 'ethereum' ? 1 : 1

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/${chain}/${loanAsset}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {market.collateralAsset?.symbol || 'Unknown'} / {market.loanAsset.symbol}
        </h1>
        <p className="text-muted-foreground">
          {market.collateralAsset?.name || 'Unknown'} as collateral, borrowing {market.loanAsset.name}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yield">Yield</TabsTrigger>
          <TabsTrigger value="collateral">Collateral</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
            <CardDescription>Total amount supplied to this market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUSD(market.state.supplyAssetsUsd)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Borrow</CardTitle>
            <CardDescription>Total amount borrowed from this market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUSD(market.state.borrowAssetsUsd)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
            <CardDescription>Current utilization rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(market.state.utilization)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply APY</CardTitle>
            <CardDescription>Annual percentage yield for suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercent(market.state.supplyApy)}
            </div>
            {market.state.netSupplyApy !== undefined && (
              <div className="text-sm text-muted-foreground mt-1">
                Net APY: {formatPercent(market.state.netSupplyApy)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Borrow APY</CardTitle>
            <CardDescription>Annual percentage yield for borrowers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPercent(market.state.borrowApy)}
            </div>
            {market.state.netBorrowApy !== undefined && (
              <div className="text-sm text-muted-foreground mt-1">
                Net APY: {formatPercent(market.state.netBorrowApy)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LLTV</CardTitle>
            <CardDescription>Liquidation Loan-to-Value ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ltv}
            </div>
          </CardContent>
        </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Details</CardTitle>
              <CardDescription>Additional market information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Loan Asset</div>
                  <div className="font-medium">{market.loanAsset.symbol}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {market.loanAsset.address}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Collateral Asset</div>
                  <div className="font-medium">{market.collateralAsset?.symbol || '-'}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {market.collateralAsset?.address || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Loan Asset Price</div>
                  <div className="font-medium">{formatUSD(market.loanAsset.priceUsd)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Collateral Asset Price</div>
                  <div className="font-medium">{formatUSD(market.collateralAsset?.priceUsd)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Market Unique Key</div>
                  <div className="text-xs font-mono break-all">{market.uniqueKey}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield">
          <YieldTab uniqueKey={uniqueKey} chainId={chainId} />
        </TabsContent>

        <TabsContent value="collateral">
          <CollateralTab uniqueKey={uniqueKey} chainId={chainId} />
        </TabsContent>

        <TabsContent value="liquidity">
          <LiquidityTab uniqueKey={uniqueKey} chainId={chainId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
