import { ethers } from "ethers";

export enum Network {
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
}

export enum RewardPoolType {
  Aura = 'Aura',
  ConvexArbitrum = 'ConvexArbitrum',
  ConvexMainnet = 'ConvexMainnet',
  Curve = 'Curve',
}

export type VaultData = {
  address: string,
  gauge: string,
  primaryBorrowCurrency: string,
} & (
    { rewardPoolType: RewardPoolType.ConvexArbitrum | RewardPoolType.Curve | RewardPoolType.Aura } |
    { lpToken: string, rewardPoolType: RewardPoolType.ConvexMainnet }
  )

export type Provider = ethers.providers.Provider;
export type JsonRpcProvider = ethers.providers.JsonRpcProvider;
