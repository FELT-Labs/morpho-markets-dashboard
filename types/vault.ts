export interface VaultAllocation {
  supplyAssets: string
  supplyAssetsUsd: number
  market: {
    uniqueKey: string
  }
}

export interface VaultState {
  allocation: VaultAllocation[]
}

export interface Vault {
  address: string
  name: string
  symbol: string
  state: VaultState
}
