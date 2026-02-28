'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import { PortfolioPerformancePoint } from '@/types/portfolio'

interface PortfolioPerformanceChartProps {
  data: PortfolioPerformancePoint[]
}

type ChartMode = 'return' | 'apy'

const CHART_MODES: Array<{ value: ChartMode; label: string }> = [
  { value: 'apy', label: 'Daily APY' },
  { value: 'return', label: 'Return' },
]

/**
 * Renders a Recharts comparison chart for portfolio return and daily APY views.
 */
export function PortfolioPerformanceChart({ data }: PortfolioPerformanceChartProps) {
  const [mode, setMode] = useState<ChartMode>('apy')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [chartWidth, setChartWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const updateWidth = () => {
      const width = containerRef.current?.clientWidth ?? 0
      setChartWidth(width)
    }

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })

    observer.observe(containerRef.current)

    window.addEventListener('resize', updateWidth)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>30-Day Historical Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
            No historical portfolio performance data available.
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = getChartConfig(mode)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>30-Day Historical Performance</CardTitle>
          <div className="inline-flex rounded-full border border-foreground/10 bg-foreground/5 p-1">
            {CHART_MODES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                  mode === item.value
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
                ].join(' ')}
                onClick={() => setMode(item.value)}
                aria-pressed={mode === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div ref={containerRef} className="h-[360px] w-full">
            {chartWidth > 0 ? (
              <LineChart
                width={Math.max(chartWidth, 320)}
                height={360}
                data={data}
                margin={{ top: 12, right: 20, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis
                  dataKey="timestamp"
                  minTickGap={24}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }}
                  tickLine={false}
                  axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                />
                <YAxis
                  tickFormatter={config.formatTick}
                  domain={config.domain}
                  tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }}
                  tickLine={false}
                  axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                  width={64}
                />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    config.formatTooltip(value ?? 0),
                    name ?? '',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.96)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey={config.recommendedKey}
                  name="Recommended Portfolio"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey={config.sovaKey}
                  name="Sova Portfolio"
                  stroke="#d946ef"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getChartConfig(mode: ChartMode) {
  const apyConfig = {
    recommendedKey: 'recommendedApy' as const,
    sovaKey: 'sovaApy' as const,
    domain: ['auto', 'auto'] as const,
    formatTick: (value: number) => formatPercent(value, 1),
    formatTooltip: (value: number) => formatPercent(value, 2),
  }

  if (mode === 'apy') {
    return apyConfig
  }

  return {
    recommendedKey: 'recommendedReturn' as const,
    sovaKey: 'sovaReturn' as const,
    domain: [100, 'auto'] as const,
    formatTick: (value: number) => formatNumber(value, 1),
    formatTooltip: (value: number) => formatNumber(value, 2),
  }
}
