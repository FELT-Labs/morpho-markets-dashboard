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
import {
  getActivityData,
} from '@/lib/services/activity-service'
import {
  ActivityMetrics,
  ActivityVolumeData,
  TimeRange,
  TransactionType,
} from '@/types/market'
import { formatUSD } from '@/lib/utils/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface ActivityTabProps {
  uniqueKey: string
  chainId: number
}

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  MarketSupply: '#10b981',
  MarketSupplyCollateral: '#34d399',
  MarketBorrow: '#3b82f6',
  MarketRepay: '#60a5fa',
  MarketWithdraw: '#f59e0b',
  MarketWithdrawCollateral: '#fbbf24',
  MarketLiquidation: '#ef4444',
}

export function ActivityTab({ uniqueKey, chainId }: ActivityTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [volumeData, setVolumeData] = useState<ActivityVolumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        // Single optimized call to fetch all activity data
        const data = await getActivityData(uniqueKey, chainId, timeRange)
        setMetrics(data.metrics)
        setVolumeData(data.volumeData)
      } catch (err) {
        console.error('Error fetching activity data:', err)
        setError('Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [uniqueKey, chainId, timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading activity data...</div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error || 'No activity data available'}</div>
      </div>
    )
  }

  // Format volume chart data
  const formattedVolumeData = volumeData.map((d) => ({
    timestamp: d.timestamp * 1000,
    supplyLoan: d.supplyLoanVolume,
    supplyCollateral: d.supplyCollateralVolume,
    borrow: d.borrowVolume,
    repay: d.repayVolume,
    withdrawLoan: d.withdrawLoanVolume,
    withdrawCollateral: d.withdrawCollateralVolume,
    liquidation: d.liquidationVolume,
  }))

  return (
    <div className="space-y-6">
      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
            <CardDescription>Last {timeRange} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatUSD(metrics.totalVolumeUsd)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.totalTransactions} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Unique addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Transaction</CardTitle>
            <CardDescription>Mean transaction size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatUSD(metrics.avgTransactionSize)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liquidations</CardTitle>
            <CardDescription>Total liquidation events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.liquidationCount}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.liquidationCount > 0
                ? `${((metrics.liquidationCount / metrics.totalTransactions) * 100).toFixed(1)}% of transactions`
                : 'No liquidations'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transaction Volume Over Time</CardTitle>
              <CardDescription>
                Daily transaction volumes by type
              </CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent>
          {formattedVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={formattedVolumeData}
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
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
                              {entry.name}: {formatUSD(entry.value)}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="supplyLoan" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketSupply} name="Supply Loan" />
                <Bar dataKey="supplyCollateral" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketSupplyCollateral} name="Supply Collateral" />
                <Bar dataKey="borrow" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketBorrow} name="Borrow" />
                <Bar dataKey="repay" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketRepay} name="Repay" />
                <Bar dataKey="withdrawLoan" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketWithdraw} name="Withdraw Loan" />
                <Bar dataKey="withdrawCollateral" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketWithdrawCollateral} name="Withdraw Collateral" />
                <Bar dataKey="liquidation" stackId="a" fill={TRANSACTION_TYPE_COLORS.MarketLiquidation} name="Liquidation" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No volume data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
