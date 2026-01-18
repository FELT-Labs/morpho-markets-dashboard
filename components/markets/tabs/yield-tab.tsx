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
import { getYieldMetrics, getYieldHistoricalData } from '@/lib/services/yield-service'
import { YieldMetrics, YieldHistoricalData, TimeRange, YieldMetricType } from '@/types/market'
import { formatPercent } from '@/lib/utils/format'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'

interface YieldTabProps {
  uniqueKey: string
  chainId: number
}

const METRIC_COLORS: Record<YieldMetricType, string> = {
  supplyApy: '#10b981',
  netSupplyApy: '#34d399',
  borrowApy: '#ef4444',
  netBorrowApy: '#f87171',
  apyAtTarget: '#a855f7',
}

const METRIC_LABELS: Record<YieldMetricType, string> = {
  supplyApy: 'Supply APY',
  netSupplyApy: 'Net Supply APY',
  borrowApy: 'Borrow APY',
  netBorrowApy: 'Net Borrow APY',
  apyAtTarget: 'APY at Target',
}

export function YieldTab({ uniqueKey, chainId }: YieldTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(90)
  const [metrics, setMetrics] = useState<YieldMetrics | null>(null)
  const [historicalData, setHistoricalData] = useState<YieldHistoricalData | null>(null)
  const [chartData, setChartData] = useState<YieldHistoricalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enabledMetrics, setEnabledMetrics] = useState<Set<YieldMetricType>>(
    new Set(['supplyApy', 'borrowApy'])
  )

  // Initial fetch for metrics (only once)
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        const [metricsData, histData] = await Promise.all([
          getYieldMetrics(uniqueKey, chainId),
          getYieldHistoricalData(uniqueKey, chainId, 90),
        ])
        setMetrics(metricsData)
        setHistoricalData(histData)
        setChartData(histData)
      } catch (err) {
        console.error('Error fetching yield data:', err)
        setError('Failed to load yield data')
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
        const histData = await getYieldHistoricalData(uniqueKey, chainId, timeRange)
        setChartData(histData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      } finally {
        setChartLoading(false)
      }
    }

    fetchChartData()
  }, [uniqueKey, chainId, timeRange, metrics])

  const toggleMetric = (metric: YieldMetricType) => {
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
        <div className="text-muted-foreground">Loading yield data...</div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error || 'No yield data available'}</div>
      </div>
    )
  }

  // Format chart data for Recharts and sort chronologically (oldest to newest)
  const formattedChartData =
    chartData && chartData.supplyApy.length > 0
      ? chartData.supplyApy
          .map((_, index) => {
            const dataPoint: any = {
              timestamp: chartData.supplyApy[index].x * 1000,
            }

            if (enabledMetrics.has('supplyApy')) {
              dataPoint.supplyApy = chartData.supplyApy[index].y
            }
            if (enabledMetrics.has('netSupplyApy') && chartData.netSupplyApy[index]) {
              dataPoint.netSupplyApy = chartData.netSupplyApy[index].y
            }
            if (enabledMetrics.has('borrowApy')) {
              dataPoint.borrowApy = chartData.borrowApy[index].y
            }
            if (enabledMetrics.has('netBorrowApy') && chartData.netBorrowApy[index]) {
              dataPoint.netBorrowApy = chartData.netBorrowApy[index].y
            }
            if (enabledMetrics.has('apyAtTarget')) {
              dataPoint.apyAtTarget = chartData.apyAtTarget[index].y
            }

            return dataPoint
          })
          .sort((a, b) => a.timestamp - b.timestamp)
      : []

  return (
    <div className="space-y-6">
      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supply APY</CardTitle>
            <CardDescription>Annual percentage yield for suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercent(metrics.supplyApy)}
            </div>
            {metrics.netSupplyApy !== undefined && (
              <div className="text-sm text-muted-foreground mt-1">
                Net APY (with rewards): {formatPercent(metrics.netSupplyApy)}
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
              {formatPercent(metrics.borrowApy)}
            </div>
            {metrics.netBorrowApy !== undefined && (
              <div className="text-sm text-muted-foreground mt-1">
                Net APY (with rewards): {formatPercent(metrics.netBorrowApy)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>APY at Target</CardTitle>
            <CardDescription>APY when utilization is at target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercent(metrics.apyAtTarget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Rate</CardTitle>
            <CardDescription>Current market utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPercent(metrics.utilization)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Fee: {formatPercent(metrics.fee)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Averages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Averages</CardTitle>
          <CardDescription>Time-averaged APY rates across different periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Period</th>
                  <th className="text-right py-3 px-4 font-medium">Supply APY</th>
                  <th className="text-right py-3 px-4 font-medium">Net Supply APY</th>
                  <th className="text-right py-3 px-4 font-medium">Borrow APY</th>
                  <th className="text-right py-3 px-4 font-medium">Net Borrow APY</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">6h Average</td>
                  <td className="text-right py-3 px-4">
                    {metrics.avgSupplyApy !== undefined
                      ? formatPercent(metrics.avgSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.avgNetSupplyApy !== undefined
                      ? formatPercent(metrics.avgNetSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.avgBorrowApy !== undefined
                      ? formatPercent(metrics.avgBorrowApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.avgNetBorrowApy !== undefined
                      ? formatPercent(metrics.avgNetBorrowApy)
                      : '-'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Daily</td>
                  <td className="text-right py-3 px-4">
                    {metrics.dailySupplyApy !== undefined
                      ? formatPercent(metrics.dailySupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.dailyNetSupplyApy !== undefined
                      ? formatPercent(metrics.dailyNetSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.dailyBorrowApy !== undefined
                      ? formatPercent(metrics.dailyBorrowApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.dailyNetBorrowApy !== undefined
                      ? formatPercent(metrics.dailyNetBorrowApy)
                      : '-'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Weekly</td>
                  <td className="text-right py-3 px-4">
                    {metrics.weeklySupplyApy !== undefined
                      ? formatPercent(metrics.weeklySupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.weeklyNetSupplyApy !== undefined
                      ? formatPercent(metrics.weeklyNetSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.weeklyBorrowApy !== undefined
                      ? formatPercent(metrics.weeklyBorrowApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.weeklyNetBorrowApy !== undefined
                      ? formatPercent(metrics.weeklyNetBorrowApy)
                      : '-'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Monthly</td>
                  <td className="text-right py-3 px-4">
                    {metrics.monthlySupplyApy !== undefined
                      ? formatPercent(metrics.monthlySupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.monthlyNetSupplyApy !== undefined
                      ? formatPercent(metrics.monthlyNetSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.monthlyBorrowApy !== undefined
                      ? formatPercent(metrics.monthlyBorrowApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.monthlyNetBorrowApy !== undefined
                      ? formatPercent(metrics.monthlyNetBorrowApy)
                      : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Yearly</td>
                  <td className="text-right py-3 px-4">
                    {metrics.yearlySupplyApy !== undefined
                      ? formatPercent(metrics.yearlySupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.yearlyNetSupplyApy !== undefined
                      ? formatPercent(metrics.yearlyNetSupplyApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.yearlyBorrowApy !== undefined
                      ? formatPercent(metrics.yearlyBorrowApy)
                      : '-'}
                  </td>
                  <td className="text-right py-3 px-4">
                    {metrics.yearlyNetBorrowApy !== undefined
                      ? formatPercent(metrics.yearlyNetBorrowApy)
                      : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Historical Performance</CardTitle>
              <CardDescription>
                Performance metrics over the last {timeRange} days
              </CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metric Toggles */}
          <div className="flex flex-wrap gap-4">
            {(Object.keys(METRIC_LABELS) as YieldMetricType[]).map((metric) => (
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
                  tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
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
                          {payload.map((entry: any) => (
                            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                              {METRIC_LABELS[entry.dataKey as YieldMetricType]}:{' '}
                              {formatPercent(entry.value)}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {enabledMetrics.has('supplyApy') && (
                  <Line
                    type="monotone"
                    dataKey="supplyApy"
                    stroke={METRIC_COLORS.supplyApy}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('netSupplyApy') && (
                  <Line
                    type="monotone"
                    dataKey="netSupplyApy"
                    stroke={METRIC_COLORS.netSupplyApy}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('borrowApy') && (
                  <Line
                    type="monotone"
                    dataKey="borrowApy"
                    stroke={METRIC_COLORS.borrowApy}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('netBorrowApy') && (
                  <Line
                    type="monotone"
                    dataKey="netBorrowApy"
                    stroke={METRIC_COLORS.netBorrowApy}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {enabledMetrics.has('apyAtTarget') && (
                  <Line
                    type="monotone"
                    dataKey="apyAtTarget"
                    stroke={METRIC_COLORS.apyAtTarget}
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
