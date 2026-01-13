# Morpho Markets Dashboard

A modern web application for browsing and analyzing Morpho lending markets across different blockchain networks.

## Features

- 📊 **Markets List**: Browse all Morpho markets with key metrics
- 🔍 **Advanced Filtering**: Filter by chain, loan asset, and collateral asset
- 📈 **Market Details**: Comprehensive market information including APYs, liquidity, and configuration
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS for a beautiful, responsive experience
- ⚡ **Fast Performance**: Server-side rendering with Next.js 16 App Router

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: GraphQL (graphql-request)
- **API**: Morpho GraphQL API

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd morpho-markets-dashboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_MORPHO_API_URL=https://api.morpho.org/graphql
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with header
│   ├── page.tsx                # Redirects to /markets
│   └── markets/
│       ├── page.tsx            # Markets list page
│       ├── loading.tsx         # Loading state
│       ├── error.tsx           # Error state
│       └── [uniqueKey]/
│           ├── page.tsx        # Market detail page
│           ├── loading.tsx     # Loading state
│           └── not-found.tsx   # Not found state
├── components/
│   ├── header.tsx              # Navigation header
│   ├── markets/
│   │   ├── market-card.tsx     # Stat card component
│   │   ├── market-filters.tsx  # Filter controls
│   │   └── markets-table.tsx   # Markets data table
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── graphql/
│   │   ├── client.ts           # GraphQL client setup
│   │   └── queries.ts          # GraphQL queries
│   └── utils.ts                # Utility functions
└── types/
    ├── market.ts               # Market-related types
    └── index.ts                # Type exports
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## API Reference

The application uses the Morpho GraphQL API to fetch market data. Key queries include:

- `GetMarkets` - Fetch paginated list of markets with filters
- `GetMarketByUniqueKey` - Fetch detailed information for a specific market
- `GetChains` - Fetch available blockchain networks
- `GetAssets` - Fetch available assets for filtering

## Features in Detail

### Markets List Page (`/markets`)

- View all available Morpho markets
- Filter by:
  - Blockchain network (Ethereum, Base, etc.)
  - Loan asset (USDC, WETH, etc.)
  - Collateral asset
- Sort by total supply value (USD)
- Click any market to view detailed information

### Market Detail Page (`/markets/[uniqueKey]`)

Displays comprehensive market information:
- Supply and borrow APYs
- Total supply, borrow, and available liquidity
- Market utilization rate
- Loan and collateral asset details
- Oracle information
- Market configuration (IRM, LLTV, fees)
- Reward programs
- Associated vaults
