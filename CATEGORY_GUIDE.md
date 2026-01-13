# Morpho Data Categories - User Guide

## Quick Reference

This guide explains how to understand and use the categorized data in the Morpho Markets Dashboard.

## The 6 Categories

### 🛡️ Safety & Risk
**What it tells you:** How safe is this market?

**Key Metrics:**
- **LLTV (Liquidation LTV):** The maximum loan-to-value before liquidation
  - Lower = Safer (e.g., 77% is safer than 96.5%)
  - Higher = More capital efficient but riskier
- **Risk Level Badge:** 
  - 🟢 Low Risk: LLTV < 85%, utilization < 80%, no warnings
  - 🟡 Medium Risk: LLTV 85-90%, utilization 80-95%
  - 🔴 High Risk: LLTV > 90%, utilization > 95%, warnings present
- **Utilization:** How much of supplied capital is borrowed
  - < 80%: Healthy
  - 80-95%: High but normal
  - > 95%: Very high, watch closely
- **Bad Debt:** Any losses that have occurred or may occur

**When to check:** Before supplying or borrowing in a market

### 💧 Liquidity & Capacity
**What it tells you:** How much capital is available?

**Key Metrics:**
- **Available Liquidity:** Amount you can borrow right now
- **Total Supply:** Total capital supplied by all lenders
- **Total Borrow:** Total amount borrowed by all borrowers
- **Total Collateral:** Total collateral locked in the market
- **Target Utilization:** Where the IRM wants utilization to be

**When to check:** 
- Before borrowing (check Available Liquidity)
- To gauge market size and depth
- To understand if there's enough liquidity for your needs

### 📈 Yield & Returns
**What it tells you:** What returns can I earn?

**Key Metrics:**
- **Net Supply APY:** Total interest rate for lenders (includes rewards)
- **Net Borrow APY:** Total cost for borrowers (net of rewards)
- **Base APY:** Core interest rate without rewards
- **Rewards:** Additional token incentives
  - Look for "+" badge indicating active rewards
  - Check reward asset and APR
- **Time-Averaged APYs:** Historical rates (6h, daily, weekly)
- **APY at Target:** Expected rate when utilization hits target

**When to check:**
- Comparing lending opportunities
- Evaluating borrowing costs
- Understanding reward programs

### 🗄️ Oracle Health
**What it tells you:** Can I trust the price feed?

**Key Metrics:**
- **Oracle Type:**
  - ✅ Chainlink Oracle V2: Most reliable
  - ✅ Chainlink Oracle: Reliable
  - ⚠️ Custom Oracle: Requires due diligence
  - ❓ Unknown: Exercise caution
- **Oracle Feeds:** Which price sources are used
- **Configuration Warnings:** Any oracle issues detected

**When to check:**
- Assessing market safety
- Understanding liquidation risk
- Evaluating price manipulation risk

### ⚙️ Market Configuration
**What it tells you:** How is this market set up?

**Key Metrics:**
- **Market ID:** Unique identifier
- **IRM Address:** Interest rate model contract
- **Creation Date:** When the market was created (older = more tested)
- **Listed Status:** Whether it's officially recognized
- **Assets:** Details about loan and collateral tokens
- **Supplying Vaults:** MetaMorpho vaults using this market

**When to check:**
- Doing deep due diligence
- Understanding market parameters
- Checking vault relationships

### 📊 Activity & Shares
**What it tells you:** Market operational details

**Key Metrics:**
- **Supply Shares:** Share-based supply tracking
- **Borrow Shares:** Share-based borrow tracking
- **Last Update:** When data was last refreshed
- **Block Number:** On-chain update reference

**When to check:**
- Verifying data freshness
- Understanding share mechanics
- Technical analysis

## How to Use the Interface

### On the Markets List Page

**Table Layout:**
```
┌─────────────┬────────┬─────────┬──────────────┬─────────────┬─────────┐
│   Market    │ Safety │  Yield  │  Liquidity  │   Oracle    │
│ Asset|Chain │  Risk  │ Sup|Bor │ Avail|Util  │    Type     │
└─────────────┴────────┴─────────┴──────────────┴─────────────┴─────────┘
```

**Quick Scanning:**
1. Look at **Safety** column for risk badges
2. Check **Yield** columns for best rates
3. Verify **Liquidity** has enough capital
4. Glance at **Oracle** for feed reliability

**Sorting:**
- Click any column header to sort
- Click again to reverse order
- Default sort: Total Supply (highest first)

### On the Market Detail Page

**Navigation:**
1. Click any market from the list
2. See 4 key metrics at the top (quick overview)
3. Use tabs to explore categories:
   - Safety → Risk assessment
   - Liquidity → Capital availability
   - Yield → Returns analysis
   - Oracle → Price feed details
   - Config → Market parameters
   - Activity → Operational metrics

**Tab Content:**
- Each tab shows only relevant metrics
- Metrics are presented as cards
- Visual indicators (colors, badges) highlight important info
- Tooltips provide explanations (hover over ℹ️ icons)

## Common Workflows

### 1. Finding a Safe Market to Supply
1. Go to Markets list
2. Look for 🟢 Low Risk badges in Safety column
3. Compare Yield → Supply APY
4. Check Liquidity → ensure market has depth
5. Verify Oracle → prefer Chainlink V2
6. Click market for details
7. Review Safety tab for full risk assessment

### 2. Comparing Borrowing Costs
1. Filter markets by your collateral asset
2. Sort by Borrow APY (Yield column)
3. Check Available Liquidity
4. Look at Safety rating (lower LLTV = less leverage)
5. Consider Oracle type for liquidation risk
6. Review Yield tab for time-averaged rates

### 3. Assessing Market Risk
1. Click into market detail
2. Go to **Safety** tab
3. Check:
   - Risk level badge
   - LLTV percentage
   - Any warnings present
   - Bad debt status
   - Price volatility (24h change)
4. Go to **Oracle** tab
5. Verify oracle type and configuration
6. Look for any oracle warnings

### 4. Understanding Rewards
1. Markets with rewards show "+" badge in Yield columns
2. Click market for details
3. Go to **Yield** tab
4. Scroll to "Rewards Programs" section
5. See:
   - Which tokens are offered
   - Supply vs Borrow rewards
   - APR for each reward
6. Calculate: Net APY = Base APY + Reward APR

### 5. Due Diligence Checklist
Before using a market, check:
- [ ] Safety: Low or Medium risk level
- [ ] Liquidity: Sufficient for your needs
- [ ] Yield: Competitive rates
- [ ] Oracle: Chainlink preferred
- [ ] Config: Market age (> 30 days = more tested)
- [ ] Activity: Recent updates (< 1 day old)

## Color Guide

### Risk Levels
- 🟢 **Green**: Low risk, safe to use
- 🟡 **Yellow**: Medium risk, requires caution
- 🔴 **Red**: High risk, exercise extreme caution

### Metric Types
- 🟢 **Green**: Supply APY, positive metrics
- 🟠 **Orange**: Borrow APY, cost metrics
- 🔵 **Blue**: Liquidity, neutral metrics
- 🟣 **Purple**: Projected/target metrics
- 🔴 **Red**: Warnings, losses, risks
- 🟡 **Yellow**: Cautions, alerts

### Oracle Status
- ✅ **Green checkmark**: Healthy configuration
- ⚠️ **Yellow alert**: Configuration warning
- ❓ **Gray question**: Unknown/custom type

## Tips & Best Practices

### For Lenders (Suppliers)
1. **Prioritize Safety** - Start with 🟢 Low Risk markets
2. **Check Liquidity** - Ensure you can withdraw when needed
3. **Consider Utilization** - Lower utilization = easier to withdraw
4. **Monitor Warnings** - Avoid markets with active warnings
5. **Diversify** - Don't put everything in one market

### For Borrowers
1. **Understand LLTV** - Know your liquidation threshold
2. **Check Oracle** - Price feed quality affects liquidation risk
3. **Monitor Utilization** - High utilization = rates may spike
4. **Watch Borrow APY** - Rates change with utilization
5. **Keep Safety Buffer** - Don't borrow to max LLTV

### General
1. **Use Categories** - Don't try to process all data at once
2. **Compare Similar Markets** - Same loan asset, different collateral
3. **Check Historical APYs** - Current rate might be temporary spike
4. **Verify Oracle Type** - Critical for safety assessment
5. **Read Warnings** - They're there for a reason

## Glossary

- **LLTV:** Liquidation Loan-to-Value - the max LTV before liquidation
- **APY:** Annual Percentage Yield - interest rate including compounding
- **APR:** Annual Percentage Rate - simple interest rate
- **Net APY:** APY including reward token incentives
- **Utilization:** Borrowed amount / Supplied amount
- **Oracle:** Smart contract providing asset price data
- **IRM:** Interest Rate Model - determines how rates change
- **Shares:** Internal accounting units (not the same as assets)
- **Bad Debt:** Losses that can't be recovered from liquidations

## Support & Feedback

If you encounter issues or have suggestions for the category system, please:
1. Check this guide first
2. Review the implementation summary
3. File an issue with specific details
4. Include which category/tab you were using

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Related:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
