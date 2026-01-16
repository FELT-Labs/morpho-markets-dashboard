'use client'

import { Button } from '@/components/ui/button'
import { TimeRange } from '@/types/market'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1Y', value: 365 },
]

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-2">
      {TIME_RANGES.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}
