import { Suspense } from 'react'
import { MarketsList } from '@/components/markets-list'

export default async function MarketListPage({
  params,
}: {
  params: Promise<{ chain: string; loanAsset: string }>
}) {
  const { chain, loanAsset } = await params

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <MarketsList chain={chain} loanAsset={loanAsset} />
    </Suspense>
  )
}
