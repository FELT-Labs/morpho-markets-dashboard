/**
 * Sort icon component for table headers
 */

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { SortDirection } from "@/hooks/use-table-sort"

interface SortIconProps {
  isActive: boolean
  direction: SortDirection
}

export function SortIcon({ isActive, direction }: SortIconProps) {
  if (!isActive) {
    return <ArrowUpDown className="ml-2 h-4 w-4 inline" />
  }
  return direction === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4 inline" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4 inline" />
  )
}
