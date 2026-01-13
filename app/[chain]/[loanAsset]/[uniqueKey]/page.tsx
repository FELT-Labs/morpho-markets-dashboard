import { notFound } from "next/navigation"
import Link from "next/link"
import { graphQLClient } from "@/lib/graphql/client"
import { GET_MARKET_BY_UNIQUE_KEY_QUERY } from "@/lib/graphql/queries"
import { MetricCard } from "@/components/markets/metric-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatPercentage, formatAddress, getChainIdFromName } from "@/lib/utils"
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react"
import { MetricTooltip } from "@/components/markets/metric-tooltip"
import type { MarketResponse } from "@/types"

async function getMarket(uniqueKey: string, chainId: number) {
  try {
    const data = await graphQLClient.request<MarketResponse>(GET_MARKET_BY_UNIQUE_KEY_QUERY, {
      uniqueKey,
      chainId,
    })
    return data.marketByUniqueKey
  } catch (error) {
    console.error("Failed to fetch market:", error)
    return null
  }
}

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ chain: string; loanAsset: string; uniqueKey: string }>
}) {
  const resolvedParams = await params
  const { chain, loanAsset, uniqueKey } = resolvedParams
  
  // Map chain name to ID
  let chainId: number
  try {
    chainId = getChainIdFromName(chain)
  } catch {
    notFound()
  }
  
  const market = await getMarket(uniqueKey, chainId)

  if (!market) {
    notFound()
  }

  const lltv = (parseInt(market.lltv) / 1e18) * 100
  const chainLabel = chain.charAt(0).toUpperCase() + chain.slice(1)
  
  // Calculate if rewards are present
  const hasSupplyRewards = market.state?.rewards?.some(r => r.supplyApr && r.supplyApr > 0)
  const hasBorrowRewards = market.state?.rewards?.some(r => r.borrowApr && r.borrowApr > 0)
  
  // Get net APYs
  const netSupplyApy = market.state?.netSupplyApy || market.state?.supplyApy
  const netBorrowApy = market.state?.netBorrowApy || market.state?.borrowApy
  
  // Calculate utilization color
  const utilization = market.state?.utilization || 0
  const utilizationColor = utilization > 0.95 ? "text-red-600 dark:text-red-400" :
    utilization > 0.80 ? "text-yellow-600 dark:text-yellow-400" :
    "text-green-600 dark:text-green-400"
  
  // Target utilizations
  const targetBorrowUtil = market.targetBorrowUtilization ? (parseInt(market.targetBorrowUtilization) / 1e18) * 100 : null
  const targetWithdrawUtil = market.targetWithdrawUtilization ? (parseInt(market.targetWithdrawUtilization) / 1e18) * 100 : null

  return (
    <div className="container mx-auto py-8 px-4">
      <Link 
        href={`/${chain}/${loanAsset}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {loanAsset} Markets
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-4xl font-bold">
            {market.loanAsset.symbol}
            {market.collateralAsset && (
              <span className="text-muted-foreground"> / {market.collateralAsset.symbol}</span>
            )}
          </h1>
          <Badge variant="outline">{chainLabel}</Badge>
          {market.listed && (
            <Badge variant="default">Listed</Badge>
          )}
          {market.warnings && market.warnings.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {market.warnings.length} Warning{market.warnings.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {market.loanAsset.name}
          {market.collateralAsset && ` / ${market.collateralAsset.name}`}
        </p>
      </div>

      {/* Market Warnings */}
      {market.warnings && market.warnings.length > 0 && (
        <Card className="mb-8 border-yellow-600 dark:border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Market Warnings
            </CardTitle>
            <CardDescription>Important alerts about this market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {market.warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg ${
                    warning.level === 'RED' 
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/20' 
                      : 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={warning.level === 'RED' ? 'destructive' : 'outline'}>
                      {warning.level}
                    </Badge>
                    <span className="font-medium">{warning.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics - Primary Display */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Net Supply APY"
            value={formatPercentage(netSupplyApy)}
            metricKey="netSupplyApy"
            subtitle={market.state?.supplyApy !== netSupplyApy && market.state?.supplyApy ? 
              `Base: ${formatPercentage(market.state.supplyApy)}` : undefined}
            badge={hasSupplyRewards ? { label: "With Rewards", variant: "secondary" } : undefined}
            valueClassName="text-green-600 dark:text-green-400"
          />
          <MetricCard
            title="Net Borrow APY"
            value={formatPercentage(netBorrowApy)}
            metricKey="netBorrowApy"
            subtitle={market.state?.borrowApy !== netBorrowApy && market.state?.borrowApy ? 
              `Base: ${formatPercentage(market.state.borrowApy)}` : undefined}
            badge={hasBorrowRewards ? { label: "With Rewards", variant: "secondary" } : undefined}
            valueClassName="text-orange-600 dark:text-orange-400"
          />
          <MetricCard
            title="Total Supply"
            value={formatCurrency(market.state?.supplyAssetsUsd)}
            metricKey="totalSupply"
            subtitle={`${market.loanAsset.symbol} supplied`}
          />
          <MetricCard
            title="Utilization"
            value={formatPercentage(market.state?.utilization)}
            metricKey="utilization"
            valueClassName={utilizationColor}
            description={targetBorrowUtil ? `Target: ${targetBorrowUtil.toFixed(0)}%` : undefined}
          />
        </div>
      </div>

      {/* Time-Averaged APY Metrics */}
      {(market.state?.avgSupplyApy || market.state?.dailySupplyApy || market.state?.weeklySupplyApy) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Time-Averaged Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {market.state.avgSupplyApy !== undefined && (
              <MetricCard
                title="6h Avg Supply"
                value={formatPercentage(market.state.avgSupplyApy)}
                metricKey="avgSupplyApy"
                valueClassName="text-green-600 dark:text-green-400 text-lg"
              />
            )}
            {market.state.avgBorrowApy !== undefined && (
              <MetricCard
                title="6h Avg Borrow"
                value={formatPercentage(market.state.avgBorrowApy)}
                metricKey="avgBorrowApy"
                valueClassName="text-orange-600 dark:text-orange-400 text-lg"
              />
            )}
            {market.state.dailySupplyApy !== undefined && (
              <MetricCard
                title="Daily Avg Supply"
                value={formatPercentage(market.state.dailySupplyApy)}
                metricKey="dailySupplyApy"
                valueClassName="text-green-600 dark:text-green-400 text-lg"
              />
            )}
            {market.state.weeklySupplyApy !== undefined && (
              <MetricCard
                title="Weekly Avg Supply"
                value={formatPercentage(market.state.weeklySupplyApy)}
                metricKey="weeklySupplyApy"
                valueClassName="text-green-600 dark:text-green-400 text-lg"
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Market State Card - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle>Market State</CardTitle>
            <CardDescription>Current market liquidity and utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Supply</span>
                <MetricTooltip metricKey="totalSupply" />
              </div>
              <span className="font-medium">{formatCurrency(market.state?.supplyAssetsUsd)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Borrow</span>
                <MetricTooltip metricKey="totalBorrow" />
              </div>
              <span className="font-medium">{formatCurrency(market.state?.borrowAssetsUsd)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Available Liquidity</span>
                <MetricTooltip metricKey="availableLiquidity" />
              </div>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(market.state?.liquidityAssetsUsd)}
              </span>
            </div>
            {market.state?.totalLiquidityUsd && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Liquidity</span>
                  <MetricTooltip metricKey="totalLiquidity" />
                </div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(market.state.totalLiquidityUsd)}
                </span>
              </div>
            )}
            {market.state?.collateralAssetsUsd && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Collateral</span>
                  <MetricTooltip metricKey="collateralAssets" />
                </div>
                <span className="font-medium">{formatCurrency(market.state.collateralAssetsUsd)}</span>
              </div>
            )}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Utilization Rate</span>
                  <MetricTooltip metricKey="utilization" />
                </div>
                <span className={`font-medium ${utilizationColor}`}>
                  {formatPercentage(market.state?.utilization)}
                </span>
              </div>
              <Progress 
                value={(market.state?.utilization || 0) * 100} 
                className="h-2"
              />
              {targetBorrowUtil && (
                <div className="text-xs text-muted-foreground mt-1">
                  Target: {targetBorrowUtil.toFixed(0)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interest Rate Model Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Rate Model</CardTitle>
            <CardDescription>Adaptive curve IRM parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {market.state?.apyAtTarget !== undefined && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">APY at Target</span>
                  <MetricTooltip metricKey="apyAtTarget" />
                </div>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {formatPercentage(market.state.apyAtTarget)}
                </span>
              </div>
            )}
            {targetBorrowUtil !== null && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Target Borrow Utilization</span>
                  <MetricTooltip metricKey="targetBorrowUtilization" />
                </div>
                <span className="font-medium">{targetBorrowUtil.toFixed(2)}%</span>
              </div>
            )}
            {targetWithdrawUtil !== null && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Target Withdraw Utilization</span>
                  <MetricTooltip metricKey="targetWithdrawUtilization" />
                </div>
                <span className="font-medium">{targetWithdrawUtil.toFixed(2)}%</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Fee Rate</span>
                <MetricTooltip metricKey="feeRate" />
              </div>
              <span className="font-medium">{formatPercentage(market.state?.fee)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">IRM Address</span>
              <a
                href={`https://etherscan.io/address/${market.irmAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs hover:text-primary inline-flex items-center gap-1"
              >
                {formatAddress(market.irmAddress)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Indicators</CardTitle>
            <CardDescription>Liquidation threshold and risk metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">LLTV (Max LTV)</span>
                <MetricTooltip metricKey="lltv" />
              </div>
              <span className="font-medium text-lg">{lltv.toFixed(2)}%</span>
            </div>
            {market.state?.dailyPriceVariation !== undefined && market.state.dailyPriceVariation !== null && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">24h Price Change</span>
                  <MetricTooltip metricKey="dailyPriceVariation" />
                </div>
                <span className={`font-medium ${
                  market.state.dailyPriceVariation > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {market.state.dailyPriceVariation > 0 ? '+' : ''}
                  {formatPercentage(market.state.dailyPriceVariation)}
                </span>
              </div>
            )}
            {market.badDebt && market.badDebt.usd && market.badDebt.usd > 0 && (
              <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Bad Debt (Unrealized)</span>
                  <MetricTooltip metricKey="badDebt" />
                </div>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(market.badDebt.usd)}
                </span>
              </div>
            )}
            {market.realizedBadDebt && market.realizedBadDebt.usd && market.realizedBadDebt.usd > 0 && (
              <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Realized Bad Debt</span>
                  <MetricTooltip metricKey="realizedBadDebt" />
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(market.realizedBadDebt.usd)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Loan and collateral asset details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium mb-2">Loan Asset</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{market.loanAsset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{market.loanAsset.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {formatAddress(market.loanAsset.address)}
                  </div>
                  {market.loanAsset.priceUsd && (
                    <div className="text-sm font-medium">
                      {formatCurrency(market.loanAsset.priceUsd)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {market.collateralAsset && (
              <div>
                <div className="text-sm font-medium mb-2">Collateral Asset</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{market.collateralAsset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{market.collateralAsset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {formatAddress(market.collateralAsset.address)}
                    </div>
                    {market.collateralAsset.priceUsd && (
                      <div className="text-sm font-medium">
                        {formatCurrency(market.collateralAsset.priceUsd)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Oracle Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Oracle Information</CardTitle>
            <CardDescription>Price oracle configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {market.oracle ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Type</span>
                    <MetricTooltip metricKey="oracleType" />
                  </div>
                  <Badge variant="outline">{market.oracle.type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Address</span>
                  <a
                    href={`https://etherscan.io/address/${market.oracle.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:text-primary inline-flex items-center gap-1"
                  >
                    {formatAddress(market.oracle.address)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No oracle information available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Market configuration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creation Block</span>
              <span className="font-medium">{market.creationBlockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creation Date</span>
              <span className="font-medium">
                {new Date(parseInt(market.creationTimestamp) * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={market.listed ? "default" : "secondary"}>
                {market.listed ? "Listed" : "Unlisted"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards */}
      {market.state?.rewards && market.state.rewards.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rewards Programs</CardTitle>
            <CardDescription>Additional incentive programs for this market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {market.state.rewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{reward.asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{reward.asset.name}</div>
                  </div>
                  <div className="text-right space-y-1">
                    {reward.supplyApr && reward.supplyApr > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Supply:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{formatPercentage(reward.supplyApr)} APR
                        </span>
                      </div>
                    )}
                    {reward.borrowApr && reward.borrowApr > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Borrow:</span>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          +{formatPercentage(reward.borrowApr)} APR
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplying Vaults */}
      {market.supplyingVaults && market.supplyingVaults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Supplying Vaults</CardTitle>
            <CardDescription>MetaMorpho vaults that supply to this market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {market.supplyingVaults.map((vault) => (
                <div key={vault.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{vault.symbol}</div>
                    <div className="text-sm text-muted-foreground">{vault.name}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{vault.chain.network}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
