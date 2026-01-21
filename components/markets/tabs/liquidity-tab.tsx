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
import { Checkbox } from '@/components/ui/checkbox'
import { getLiquidityMetrics, getLiquidityHistoricalData } from '@/lib/services/liquidity-service'
import { 
  LiquidityMetrics, 
  LiquidityHistoricalData, 
  TimeRange, 
  LiquidityMetricType,
  PublicAllocatorLiquidity 
} from '@/types/market'
import { formatUSD, formatPercent, formatBigInt } from '@/lib/utils/format'
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

interface LiquidityTabProps {
  uniqueKey: string
  chainId: number
}

const METRIC_COLORS: Record<LiquidityMetricType, string> = {
  liquidityAssetsUsd: '#3b82f6',
  supplyAssetsUsd: '#10b981',
  borrowAssetsUsd: '#ef4444',
  utilization: '#f59e0b',
}

const METRIC_LABELS: Record<LiquidityMetricType, string> = {
  liquidityAssetsUsd: 'Available Liquidity',
  supplyAssetsUsd: 'Total Supply',
  borrowAssetsUsd: 'Total Borrow',
  utilization: 'Utilization',
}

export function LiquidityTab({ uniqueKey, chainId }: LiquidityTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(90)
  const [metrics, setMetrics] = useState<LiquidityMetrics | null>(null)
  const [publicAllocator, setPublicAllocator] = useState<PublicAllocatorLiquidity[]>([])
  const [historicalData, setHistoricalData] = useState<LiquidityHistoricalData | null>(null)
  const [chartData, setChartData] = useState<LiquidityHistoricalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enabledMetrics, setEnabledMetrics] = useState<Set<LiquidityMetricType>>(
    new Set(['liquidityAssetsUsd', 'supplyAssetsUsd', 'borrowAssetsUsd'])
  )

  // Initial fetch for metrics (only once)
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        const [liquidityData, histData] = await Promise.all([
          getLiquidityMetrics(uniqueKey, chainId),
          getLiquidityHistoricalData(uniqueKey, chainId, 90),
        ])
        setMetrics(liquidityData.metrics)
        setPublicAllocator(liquidityData.publicAllocator)
        setHistoricalData(histData)
        setChartData(histData)
      } catch (err) {
        console.error('Error fetching liquidity data:', err)
        setError('Failed to load liquidity data')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [uniqueKey, chainId])

  // Fetch chart data when time range changes
  useEffect(() => {
    if (!metrics) return

    async function fetchChartData() {
      setChartLoading(true)
      try {
        const histData = await getLiquidityHistoricalData(uniqueKey, chainId, timeRange)
        setChartData(histData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      } finally {
        setChartLoading(false)
      }
    }

    fetchChartData()
  }, [uniqueKey, chainId, timeRange, metrics])

  const toggleMetric = (metric: LiquidityMetricType) => {
    setEnabledMetrics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(metric)) {
        newSet.delete(metric)
      } else {
        newSet.add(metric)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading liquidity data...</div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error || 'No liquidity data available'}</div>
      </div>
    )
  }

  // Calculate total available liquidity (including reallocatable)
  const reallocatableUsd = metrics.reallocatableLiquidityAssets 
    ? formatBigInt(metrics.reallocatableLiquidityAssets, 18) * (metrics.liquidityAssetsUsd || 0) / formatBigInt(metrics.liquidityAssets, 18)
    : 0
  
  const totalAvailableUsd = (metrics.liquidityAssetsUsd || 0) + reallocatableUsd

  // Format chart data for Recharts and sort chronologically (oldest to newest)
  const formattedChartData =
    chartData && chartData.liquidityAssetsUsd.length > 0
      ? chartData.liquidityAssetsUsd
          .map((_, index) => {
            const dataPoint: any = {
              timestamp: chartData.liquidityAssetsUsd[index].x * 1000,
            }

            if (enabledMetrics.has('liquidityAssetsUsd')) {
              dataPoint.liquidityAssetsUsd = chartData.liquidityAssetsUsd[index].y
            }
            if (enabledMetrics.has('supplyAssetsUsd')) {
              dataPoint.supplyAssetsUsd = chartData.supplyAssetsUsd[index].y
            }
            if (enabledMetrics.has('borrowAssetsUsd')) {
              dataPoint.borrowAssetsUsd = chartData.borrowAssetsUsd[index].y
            }
            if (enabledMetrics.has('utilization')) {
              dataPoint.utilization = chartData.utilization[index].y
            }

            return dataPoint
          })
          .sort((a, b) => a.timestamp - b.timestamp)
      : []

  return (
    <div className="space-y-6">
      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Liquidity</CardTitle>
            <CardDescription>Immediately available to borrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatUSD(metrics.liquidityAssetsUsd)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reallocatable Liquidity</CardTitle>
            <CardDescription>Via Public Allocator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reallocatableUsd > 0 ? formatUSD(reallocatableUsd) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Available</CardTitle>
            <CardDescription>Available + Reallocatable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatUSD(totalAvailableUsd)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Rate</CardTitle>
            <CardDescription>Current market utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatPercent(metrics.utilization)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supply & Demand Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Market Composition</CardTitle>
          <CardDescription>Breakdown of market assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Supply</div>
              <div className="text-lg font-semibold">
                {formatUSD(metrics.supplyAssetsUsd)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Borrowed</div>
              <div className="text-lg font-semibold">
                {formatUSD(metrics.borrowAssetsUsd)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Collateral Locked</div>
              <div className="text-lg font-semibold">
                {formatUSD(metrics.collateralAssetsUsd)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Available to Borrow</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatUSD(metrics.liquidityAssetsUsd)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Target Utilization Metrics</CardTitle>
          <CardDescription>Optimal utilization ranges for this market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Target Borrow Utilization</div>
              <div className="text-xl font-semibold">
                {formatPercent(formatBigInt(metrics.targetBorrowUtilization, 18))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Target Withdraw Utilization</div>
              <div className="text-xl font-semibold">
                {formatPercent(formatBigInt(metrics.targetWithdrawUtilization, 18))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Current Utilization</div>
              <div className="text-xl font-semibold">
                {formatPercent(metrics.utilization)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.utilization > formatBigInt(metrics.targetBorrowUtilization, 18)
                  ? 'Above target'
                  : 'Within target'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Allocator Shared Liquidity */}
      {publicAllocator && publicAllocator.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Public Allocator Shared Liquidity</CardTitle>
            <CardDescription>
              Liquidity from other markets available via Public Allocator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Source Market</th>
                    <th className="text-left py-3 px-4 font-medium">Market Pair</th>
                    <th className="text-right py-3 px-4 font-medium">Available Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {publicAllocator.map((item) => {
                    const assetsValue = formatBigInt(item.assets, 18)
                    const assetsUsd = assetsValue * (metrics.liquidityAssetsUsd || 0) / formatBigInt(metrics.liquidityAssets, 18)
                    const marketUrl = `https://app.morpho.org/ethereum/market/${item.withdrawMarket.uniqueKey}`
                    const marketPair = item.withdrawMarket.collateralAsset 
                      ? `${item.withdrawMarket.collateralAsset.symbol} / ${item.withdrawMarket.loanAsset.symbol}`
                      : item.withdrawMarket.loanAsset.symbol
                    
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-xs">
                          <a
                            href={marketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.withdrawMarket.uniqueKey.slice(0, 10)}...
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          {marketPair}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatUSD(assetsUsd)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Historical Liquidity</CardTitle>
              <CardDescription>
                Liquidity metrics over the last {timeRange} days
              </CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metric Toggles */}
          <div className="flex flex-wrap gap-4">
            {(Object.keys(METRIC_LABELS) as LiquidityMetricType[]).map((metric) => (
              <Checkbox
                key={metric}
                checked={enabledMetrics.has(metric)}
                onChange={() => toggleMetric(metric)}
                label={
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: METRIC_COLORS[metric] }}
                    />
                    {METRIC_LABELS[metric]}
                  </span>
                }
              />
            ))}
          </div>

          {/* Chart */}
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
                  yAxisId="left"
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="text-sm font-semibold mb-2">
                            {format(new Date(data.timestamp), 'MMM d, yyyy')}
                          </p>
                          {payload.map((entry: any) => {
                            const isUtilization = entry.dataKey === 'utilization'
                            return (
                              <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                                {METRIC_LABELS[entry.dataKey as LiquidityMetricType]}:{' '}
                                {isUtilization ? formatPercent(entry.value) : formatUSD(entry.value)}
                              </p>
                            )
                          })}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {enabledMetrics.has('liquidityAssetsUsd') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="liquidityAssetsUsd"
                    stroke={METRIC_COLORS.liquidityAssetsUsd}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('supplyAssetsUsd') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="supplyAssetsUsd"
                    stroke={METRIC_COLORS.supplyAssetsUsd}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('borrowAssetsUsd') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="borrowAssetsUsd"
                    stroke={METRIC_COLORS.borrowAssetsUsd}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('utilization') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    stroke={METRIC_COLORS.utilization}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No historical data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
