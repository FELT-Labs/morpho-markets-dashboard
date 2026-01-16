'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TimeRangeSelector } from '@/components/markets/time-range-selector'
import { CollateralRiskAnalysis } from '@/components/markets/collateral-risk-analysis'
import { getCollateralPriceData } from '@/lib/services/collateral-service'
import { CollateralPriceData, TimeRange } from '@/types/market'
import { formatUSD, formatPercent } from '@/lib/utils/format'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface CollateralTabProps {
  uniqueKey: string
  chainId: number
}

export function CollateralTab({ uniqueKey, chainId }: CollateralTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(90)
  const [metricData, setMetricData] = useState<CollateralPriceData | null>(null)
  const [chartData, setChartData] = useState<CollateralPriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch for metrics (only once)
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        const priceData = await getCollateralPriceData(uniqueKey, chainId, 90)
        setMetricData(priceData)
        setChartData(priceData)
      } catch (err) {
        console.error('Error fetching collateral data:', err)
        setError('Failed to load collateral data')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [uniqueKey, chainId])

  // Fetch chart data when time range changes
  useEffect(() => {
    if (!metricData) return

    async function fetchChartData() {
      setChartLoading(true)
      try {
        const priceData = await getCollateralPriceData(uniqueKey, chainId, timeRange)
        setChartData(priceData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      } finally {
        setChartLoading(false)
      }
    }

    fetchChartData()
  }, [uniqueKey, chainId, timeRange, metricData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading collateral data...</div>
      </div>
    )
  }

  if (error || !metricData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error || 'No collateral data available'}</div>
      </div>
    )
  }

  const variationColor = metricData.dailyPriceVariation 
    ? metricData.dailyPriceVariation >= 0 
      ? 'text-green-600' 
      : 'text-red-600'
    : ''

  // Format chart data for Recharts and sort chronologically (oldest to newest)
  const formattedChartData = chartData?.historicalPrices
    .map((point) => ({
      timestamp: point.x * 1000, // Convert to milliseconds
      price: point.y,
    }))
    .sort((a, b) => a.timestamp - b.timestamp) || []

  // Calculate Y-axis domain for better visibility
  const prices = formattedChartData.map(d => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.1 || 1
  const yDomain = [minPrice - padding, maxPrice + padding]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{metricData.symbol} Price Data</h3>
        <p className="text-sm text-muted-foreground">{metricData.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
            <CardDescription>Latest spot price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUSD(metricData.currentPrice)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oracle Price</CardTitle>
            <CardDescription>On-chain oracle price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUSD(metricData.oraclePrice)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24h Change</CardTitle>
            <CardDescription>Daily price variation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${variationColor}`}>
              {metricData.dailyPriceVariation !== undefined 
                ? formatPercent(metricData.dailyPriceVariation)
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Historical Price</CardTitle>
              <CardDescription>
                Price history over the last {timeRange} days
              </CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart 
                data={formattedChartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={yDomain}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="text-sm font-semibold">
                            {format(new Date(data.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Price: {formatUSD(data.price)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No historical price data available
            </div>
          )}
        </CardContent>
      </Card>

      <CollateralRiskAnalysis
        uniqueKey={uniqueKey}
        chainId={chainId}
        collateralSymbol={metricData.symbol}
        currentPrice={metricData.currentPrice}
      />
    </div>
  )
}
