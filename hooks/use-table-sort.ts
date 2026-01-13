/**
 * Custom hook for table sorting logic
 */

import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface UseSortableTableOptions<T, K extends string> {
  data: T[]
  initialSortField?: K
  initialSortDirection?: SortDirection
  getSortValue: (item: T, field: K) => number
}

export interface UseSortableTableReturn<K extends string> {
  sortedData: any[]
  sortField: K
  sortDirection: SortDirection
  handleSort: (field: K) => void
}

/**
 * Hook for managing table sorting state and logic
 */
export function useSortableTable<T, K extends string>({
  data,
  initialSortField,
  initialSortDirection = 'desc',
  getSortValue,
}: UseSortableTableOptions<T, K>): UseSortableTableReturn<K> {
  const [sortField, setSortField] = useState<K | undefined>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)

  const sortedData = useMemo(() => {
    if (!sortField) return data

    const sorted = [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return sorted
  }, [data, sortField, sortDirection, getSortValue])

  const handleSort = useCallback((field: K) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }, [sortField])

  return {
    sortedData,
    sortField: sortField as K,
    sortDirection,
    handleSort,
  }
}
