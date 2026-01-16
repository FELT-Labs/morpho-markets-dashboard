'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getCollateralRiskData } from '@/lib/services/collateral-risk-service'
import { CollateralRiskData } from '@/types/market'
import { formatUSD, formatPercent, formatBigInt } from '@/lib/utils/format'
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react'

interface CollateralRiskAnalysisProps {
  uniqueKey: string
  chainId: number
  collateralSymbol: string
  currentPrice?: number
}

export function CollateralRiskAnalysis({ 
  uniqueKey, 
  chainId, 
  collateralSymbol,
  currentPrice 
}: CollateralRiskAnalysisProps) {
  const [data, setData] = useState<CollateralRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const riskData = await getCollateralRiskData(uniqueKey, chainId, 20)
        setData(riskData)
      } catch (err) {
        console.error('Error fetching risk data:', err)
        setError('Failed to load risk data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [uniqueKey, chainId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading risk data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-600">{error || 'No risk data available'}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const lltv = formatBigInt(data.lltv, 18)
  const currentLTV = data.collateralAssetsUsd && data.borrowAssetsUsd && data.collateralAssetsUsd > 0
    ? data.borrowAssetsUsd / data.collateralAssetsUsd
    : 0

  const liquidationPrice = currentPrice && lltv > 0
    ? currentPrice * (currentLTV / lltv)
    : undefined

  const safetyBuffer = lltv > 0 ? ((lltv - currentLTV) / lltv) * 100 : 0

  // Filter and sort risk data by price ratio descending (closest to current price first)
  const sortedRiskData = [...data.collateralAtRisk]
    .filter(point => point.collateralUsd > 0)
    .sort((a, b) => b.collateralPriceRatio - a.collateralPriceRatio)
    .slice(0, 10) // Show top 10 most relevant price points

  // Calculate price drops for display
  const riskWithPriceDrops = sortedRiskData.map(point => ({
    ...point,
    priceDrop: (1 - point.collateralPriceRatio) * 100,
    targetPrice: currentPrice ? currentPrice * point.collateralPriceRatio : undefined
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Analysis
        </CardTitle>
        <CardDescription>
          Liquidation risk and collateral health metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">LLTV</div>
            <div className="text-2xl font-bold">{formatPercent(lltv)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Liquidation threshold
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Current LTV</div>
            <div className="text-2xl font-bold">{formatPercent(currentLTV)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Current loan-to-value ratio
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${
            safetyBuffer < 10 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' :
            safetyBuffer < 30 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' :
            'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
          }`}>
            <div className="text-sm text-muted-foreground mb-1">Safety Buffer</div>
            <div className="text-2xl font-bold">{safetyBuffer.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Distance to liquidation
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Collateral</div>
            <div className="text-lg font-semibold">
              {formatUSD(data.collateralAssetsUsd)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatBigInt(data.collateralAssets, data.collateralDecimals).toFixed(4)} {collateralSymbol}
            </div>
          </div>

          {liquidationPrice && (
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Liquidation Price
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatUSD(liquidationPrice)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentPrice && ((liquidationPrice / currentPrice - 1) * 100).toFixed(1)}% from current
              </div>
            </div>
          )}
        </div>

        {/* Collateral at Risk Table */}
        {riskWithPriceDrops.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="font-semibold">Collateral at Risk by Price Drop</h4>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Price Drop</th>
                      <th className="text-left p-3 font-medium">Target Price</th>
                      <th className="text-right p-3 font-medium">Amount at Risk</th>
                      <th className="text-right p-3 font-medium">USD Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {riskWithPriceDrops.map((point, index) => (
                      <tr 
                        key={index}
                        className={
                          point.priceDrop < 10 ? 'bg-red-50 dark:bg-red-950/10' :
                          point.priceDrop < 20 ? 'bg-orange-50 dark:bg-orange-950/10' :
                          point.priceDrop < 30 ? 'bg-yellow-50 dark:bg-yellow-950/10' :
                          ''
                        }
                      >
                        <td className="p-3 font-medium">
                          -{point.priceDrop.toFixed(1)}%
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {point.targetPrice ? formatUSD(point.targetPrice) : '-'}
                        </td>
                        <td className="p-3 text-right">
                          {formatBigInt(point.collateralAssets, data.collateralDecimals).toFixed(2)} {collateralSymbol}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatUSD(point.collateralUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This table shows how much collateral would be at risk of liquidation at different price levels
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
