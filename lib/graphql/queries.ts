import { gql } from 'graphql-request'

export const GET_MARKETS_QUERY = gql`
  query GetMarkets(
    $first: Int
    $skip: Int
    $chainId_in: [Int!]
    $loanAssetAddress_in: [String!]
    $orderBy: MarketOrderBy
    $orderDirection: OrderDirection
  ) {
    markets(
      first: $first
      skip: $skip
      where: {
        listed: true
        chainId_in: $chainId_in
        loanAssetAddress_in: $loanAssetAddress_in
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        id
        uniqueKey
        lltv
        listed
        creationTimestamp
        loanAsset {
          id
          symbol
          address
          name
          decimals
          logoURI
          priceUsd
        }
        collateralAsset {
          id
          symbol
          address
          name
          decimals
          logoURI
          priceUsd
        }
        morphoBlue {
          chain {
            id
            network
            currency
          }
        }
        state {
          id
          supplyAssets
          borrowAssets
          supplyAssetsUsd
          borrowAssetsUsd
          supplyApy
          borrowApy
          netSupplyApy
          netBorrowApy
          utilization
          liquidityAssets
          liquidityAssetsUsd
          collateralAssets
          collateralAssetsUsd
          fee
          timestamp
          supplyShares
          borrowShares
          avgSupplyApy
          avgBorrowApy
          avgNetSupplyApy
          avgNetBorrowApy
          dailySupplyApy
          dailyBorrowApy
          weeklySupplyApy
          weeklyBorrowApy
          apyAtTarget
          totalLiquidity
          totalLiquidityUsd
          dailyPriceVariation
        }
      }
      pageInfo {
        countTotal
        count
        limit
        skip
      }
    }
  }
`

export const GET_MARKET_BY_UNIQUE_KEY_QUERY = gql`
  query GetMarketByUniqueKey($uniqueKey: String!, $chainId: Int!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      id
      uniqueKey
      lltv
      irmAddress
      creationTimestamp
      creationBlockNumber
      listed
      targetBorrowUtilization
      targetWithdrawUtilization
      badDebt {
        underlying
        usd
      }
      realizedBadDebt {
        underlying
        usd
      }
      warnings {
        type
        level
      }
      loanAsset {
        id
        symbol
        address
        name
        decimals
        logoURI
        priceUsd
      }
      collateralAsset {
        id
        symbol
        address
        name
        decimals
        logoURI
        priceUsd
      }
      morphoBlue {
        chain {
          id
          network
          currency
          blockTimeMs
        }
      }
      oracle {
        id
        address
        type
        chain {
          id
          network
        }
      }
      state {
        id
        supplyAssets
        borrowAssets
        supplyAssetsUsd
        borrowAssetsUsd
        supplyApy
        borrowApy
        netSupplyApy
        netBorrowApy
        utilization
        liquidityAssets
        liquidityAssetsUsd
        collateralAssets
        collateralAssetsUsd
        fee
        timestamp
        supplyShares
        borrowShares
        avgSupplyApy
        avgBorrowApy
        avgNetSupplyApy
        avgNetBorrowApy
        dailySupplyApy
        dailyBorrowApy
        weeklySupplyApy
        weeklyBorrowApy
        apyAtTarget
        totalLiquidity
        totalLiquidityUsd
        dailyPriceVariation
        rewards {
          supplyApr
          borrowApr
          asset {
            id
            symbol
            address
            name
            logoURI
          }
        }
      }
      supplyingVaults {
        id
        address
        symbol
        name
        chain {
          id
          network
        }
      }
    }
  }
`

export const GET_CHAINS_QUERY = gql`
  query GetChains {
    chains {
      id
      network
      currency
    }
  }
`

export const GET_ASSETS_QUERY = gql`
  query GetAssets($first: Int, $chainId_in: [Int!]) {
    assets(
      first: $first
      where: { listed: true, chainId_in: $chainId_in, isMarketAsset: true }
      orderBy: Address
    ) {
      items {
        id
        symbol
        address
        name
        logoURI
        chain {
          id
          network
        }
      }
    }
  }
`
