import { graphQLClient } from '@/lib/graphql/client'
import { CollateralRiskData } from '@/types/market'

const GET_COLLATERAL_RISK_DATA_QUERY = `
  query GetCollateralRiskData($uniqueKey: String!, $chainId: Int!, $numberOfPoints: Float!) {
    marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
      lltv
      collateralAsset {
        decimals
      }
      state {
        collateralAssets
        collateralAssetsUsd
        borrowAssets
        borrowAssetsUsd
      }
    }
    marketCollateralAtRisk(uniqueKey: $uniqueKey, chainId: $chainId, numberOfPoints: $numberOfPoints) {
      collateralAtRisk {
        collateralPriceRatio
        collateralAssets
        collateralUsd
      }
    }
  }
`

interface GraphQLResponse {
  marketByUniqueKey: {
    lltv: string
    collateralAsset: {
      decimals: number
    } | null
    state: {
      collateralAssets: string
      collateralAssetsUsd?: number
      borrowAssets: string
      borrowAssetsUsd?: number
    }
  }
  marketCollateralAtRisk: {
    collateralAtRisk: Array<{
      collateralPriceRatio: number
      collateralAssets: string
      collateralUsd: number
    }>
  }
}

export async function getCollateralRiskData(
  uniqueKey: string,
  chainId: number,
  numberOfPoints: number = 20
): Promise<CollateralRiskData | null> {
  try {
    const data = await graphQLClient.request<GraphQLResponse>(
      GET_COLLATERAL_RISK_DATA_QUERY,
      {
        uniqueKey,
        chainId,
        numberOfPoints
      }
    )

    const { marketByUniqueKey, marketCollateralAtRisk } = data

    if (!marketByUniqueKey) {
      return null
    }

    return {
      lltv: marketByUniqueKey.lltv,
      collateralDecimals: marketByUniqueKey.collateralAsset?.decimals || 18,
      collateralAssets: marketByUniqueKey.state.collateralAssets,
      collateralAssetsUsd: marketByUniqueKey.state.collateralAssetsUsd,
      borrowAssets: marketByUniqueKey.state.borrowAssets,
      borrowAssetsUsd: marketByUniqueKey.state.borrowAssetsUsd,
      collateralAtRisk: marketCollateralAtRisk.collateralAtRisk || []
    }
  } catch (error) {
    console.error('Error fetching collateral risk data:', error)
    throw error
  }
}
