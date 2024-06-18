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

export type VaultDataBase = {
  address: string,
  gauge: string,
  pool?: string,
  primaryBorrowCurrency: string,
  rewardPoolType: RewardPoolType,
}

export type VaultData = VaultDataBase & { pool: string }
export type Provider = ethers.providers.Provider;
export type JsonRpcProvider = ethers.providers.JsonRpcProvider;

export type TransferLog = {
  token: string;
  from: string;
  to: string;
  amount: string;
}
