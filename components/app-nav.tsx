'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/ethereum/usdc', label: 'Dashboard' },
  { href: '/portfolio', label: 'Portfolio' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 p-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white',
            ].join(' ')}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
