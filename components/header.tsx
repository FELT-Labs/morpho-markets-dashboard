import Link from "next/link"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/markets" className="flex items-center gap-2">
            <div className="text-2xl font-bold">Morpho Markets</div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              href="/markets" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Markets
            </Link>
            <a
              href="https://morpho.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About Morpho
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
