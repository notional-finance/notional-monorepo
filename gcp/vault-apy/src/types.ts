import { ethers } from "ethers";

export enum Network {
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
}

export enum VaultTypes {
  Aura = 'Aura',
  Convex = 'Convex',
  Curve = 'Curve',
}

export type VaultData = {
  address: string,
  gauge: string,
  primaryBorrowCurrency: string,
  type: VaultTypes
}

export type Provider = ethers.providers.Provider;
export type JsonRpcProvider = ethers.providers.JsonRpcProvider;
