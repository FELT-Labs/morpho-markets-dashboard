'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MarketControlsProps {
  chain: string
  loanAsset: string
}

export function MarketControls({ chain, loanAsset }: MarketControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [minSupply, setMinSupply] = useState(searchParams.get('minSupply') || '')
  const [limit, setLimit] = useState(searchParams.get('limit') || '100')

  useEffect(() => {
    setMinSupply(searchParams.get('minSupply') || '')
    setLimit(searchParams.get('limit') || '100')
  }, [searchParams])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/${chain}/${loanAsset}?${params.toString()}`)
  }

  const handleMinSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinSupply(value)
    
    // Only update URL if value is a valid number or empty
    if (value === '' || !isNaN(Number(value))) {
      updateParams('minSupply', value)
    }
  }

  const handleLimitChange = (value: string) => {
    setLimit(value)
    updateParams('limit', value)
  }

  const clearFilters = () => {
    setMinSupply('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('minSupply')
    
    // Keep orderBy, orderDirection, and limit
    router.push(`/${chain}/${loanAsset}?${params.toString()}`)
  }

  const hasFilters = minSupply !== ''

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <label htmlFor="minSupply" className="text-sm font-medium whitespace-nowrap">
          Min Supply:
        </label>
        <Input
          id="minSupply"
          type="number"
          placeholder="e.g., 1000000"
          value={minSupply}
          onChange={handleMinSupplyChange}
          className="w-40"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="limit" className="text-sm font-medium whitespace-nowrap">
          Limit:
        </label>
        <Select value={limit} onValueChange={handleLimitChange}>
          <SelectTrigger id="limit" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="250">250</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
