/**
 * Centralized metric explanations for tooltips across the dashboard.
 * Based on Morpho Blue protocol documentation.
 */

export interface MetricExplanation {
  title: string
  description: string
  formula?: string
  learnMoreUrl?: string
}

export const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  // APY Metrics
  supplyApy: {
    title: "Supply APY",
    description: "Annual Percentage Yield earned by suppliers on their deposited assets, excluding rewards. This is the base rate determined by the Interest Rate Model based on current market utilization.",
    formula: "APY = e^(rate) - 1",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  netSupplyApy: {
    title: "Net Supply APY",
    description: "Total Annual Percentage Yield including base rate and additional protocol rewards/incentives. This represents your actual earnings as a supplier.",
    formula: "Net APY = Base APY + Rewards APR",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  borrowApy: {
    title: "Borrow APY",
    description: "Annual interest rate paid by borrowers on their loans, excluding rewards. This rate is determined by the Interest Rate Model and increases with market utilization.",
    formula: "APY = e^(rate) - 1",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  netBorrowApy: {
    title: "Net Borrow APY",
    description: "Effective borrow rate after accounting for rewards and incentives. A lower net borrow rate means you're earning rewards that offset borrowing costs.",
    formula: "Net APY = Base APY - Rewards APR",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  avgSupplyApy: {
    title: "6h Average Supply APY",
    description: "6-hour rolling average of the supply APY, excluding rewards. This smooths out short-term volatility and provides a more stable rate indicator.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  avgNetSupplyApy: {
    title: "6h Average Net Supply APY",
    description: "6-hour rolling average of the net supply APY, including rewards. Useful for understanding recent rate trends without instantaneous fluctuations.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  avgBorrowApy: {
    title: "6h Average Borrow APY",
    description: "6-hour rolling average of the borrow APY, excluding rewards. Helps assess borrowing costs over a recent timeframe.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  avgNetBorrowApy: {
    title: "6h Average Net Borrow APY",
    description: "6-hour rolling average of the net borrow APY, including rewards. Shows recent effective borrowing costs after incentives.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  dailySupplyApy: {
    title: "Daily Average Supply APY",
    description: "Daily average of the supply APY over the last 24 hours, excluding rewards. Provides a daily snapshot of earning rates.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  dailyBorrowApy: {
    title: "Daily Average Borrow APY",
    description: "Daily average of the borrow APY over the last 24 hours, excluding rewards. Shows typical borrowing costs for the day.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  weeklySupplyApy: {
    title: "Weekly Average Supply APY",
    description: "Weekly average of the supply APY over the last 7 days, excluding rewards. Useful for understanding longer-term rate stability.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  weeklyBorrowApy: {
    title: "Weekly Average Borrow APY",
    description: "Weekly average of the borrow APY over the last 7 days, excluding rewards. Helps assess typical weekly borrowing costs.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  apyAtTarget: {
    title: "APY at Target Utilization",
    description: "The APY that would be earned if the market was at its target utilization rate (typically 90%). This is a key parameter of the Adaptive Curve IRM and shows the equilibrium rate.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Utilization Metrics
  utilization: {
    title: "Utilization Rate",
    description: "Percentage of supplied assets that are currently borrowed. Higher utilization generally leads to higher APYs for suppliers and borrowers. Most markets target ~90% utilization.",
    formula: "Utilization = (Total Borrowed / Total Supplied) × 100%",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  targetBorrowUtilization: {
    title: "Target Borrow Utilization",
    description: "The target utilization rate for this market's Interest Rate Model. When actual utilization exceeds this target, rates increase to encourage repayment or more supply.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  targetWithdrawUtilization: {
    title: "Target Withdraw Utilization",
    description: "The maximum utilization threshold before withdrawals may be restricted to protect liquidity. Ensures borrowers can always be liquidated.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Liquidity Metrics
  totalSupply: {
    title: "Total Supply",
    description: "Total amount of loan assets currently supplied to this market by lenders. This represents the lending pool available for borrowers.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  totalBorrow: {
    title: "Total Borrow",
    description: "Total amount of loan assets currently borrowed from this market. This increases over time as interest accrues on outstanding loans.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  availableLiquidity: {
    title: "Available Liquidity",
    description: "Amount of loan assets available to borrow right now. This is the difference between total supply and total borrow (Supply - Borrow = Liquidity).",
    formula: "Liquidity = Total Supply - Total Borrow",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  totalLiquidity: {
    title: "Total Liquidity (Including Shared)",
    description: "Total liquidity available including assets that can be reallocated from other markets via Morpho's Public Allocator. This represents maximum borrowing capacity.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  collateralAssets: {
    title: "Total Collateral",
    description: "Total value of collateral assets deposited in this market. Borrowers must maintain sufficient collateral to avoid liquidation.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Risk Metrics
  lltv: {
    title: "LLTV (Liquidation Loan-to-Value)",
    description: "Maximum loan-to-value ratio before liquidation occurs. For example, 94.5% LLTV means positions are liquidated when the loan reaches 94.5% of the collateral's value. Higher LLTV = higher capital efficiency but higher risk.",
    formula: "LLTV = (Loan Value / Collateral Value) × 100%",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  feeRate: {
    title: "Fee Rate",
    description: "Percentage of interest that goes to the protocol or market creator as fees. This is deducted from supplier earnings and varies by market.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  badDebt: {
    title: "Bad Debt",
    description: "Unrealized bad debt in the market - loans where collateral value has fallen below the borrowed amount. This represents potential losses that haven't been socialized yet.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  realizedBadDebt: {
    title: "Realized Bad Debt",
    description: "Bad debt that has been realized and socialized among suppliers. This directly reduces the value of supplied assets in the market.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  marketWarnings: {
    title: "Market Warnings",
    description: "Important alerts about potential risks or issues in this market. Yellow warnings indicate caution, red warnings indicate serious concerns.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  dailyPriceVariation: {
    title: "24h Collateral Price Change",
    description: "Percentage change in collateral asset price over the last 24 hours. High volatility increases liquidation risk for borrowers.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Reward Metrics
  supplyRewards: {
    title: "Supply Rewards",
    description: "Additional APR earned from protocol incentives or rewards programs. These are typically distributed in separate reward tokens.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  borrowRewards: {
    title: "Borrow Rewards",
    description: "APR earned from incentive programs that reward borrowers. These offset borrowing costs and may make borrowing profitable.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Oracle Metrics
  oracleType: {
    title: "Oracle Type",
    description: "Type of price oracle used to determine asset values. Common types include Chainlink (most reliable), custom oracles, and wrapped/vault token oracles.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  // Market Info
  creationTimestamp: {
    title: "Market Creation Date",
    description: "When this market was created and deployed on-chain. Newer markets may have less historical data and adoption.",
    learnMoreUrl: "https://docs.morpho.org",
  },
  
  listed: {
    title: "Listed Status",
    description: "Whether this market is officially listed and approved by Morpho. Listed markets have passed security reviews and meet quality standards.",
    learnMoreUrl: "https://docs.morpho.org",
  },
}

/**
 * Get explanation for a specific metric
 */
export function getMetricExplanation(metricKey: string): MetricExplanation | undefined {
  return METRIC_EXPLANATIONS[metricKey]
}

/**
 * Check if a metric has an explanation available
 */
export function hasExplanation(metricKey: string): boolean {
  return metricKey in METRIC_EXPLANATIONS
}
