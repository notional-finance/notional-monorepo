import { BigNumber } from 'ethers';
import { Network } from '@notional-finance/util';

export type Position = [string, string]; // [accountAddress, vaultAddress]

export type RiskyPosition = {
  account: string;
  vault: string;
  borrowed: BigNumber;
  collateralValue: BigNumber;
  maxBorrow: BigNumber;
  healthFactor: number;
};

export type EnrichedPosition = RiskyPosition & {
  isWithdrawRequestPending: boolean;
  canWithdrawRequestFinalize: boolean;
  totalVaultShares: BigNumber;
};

export interface Env {
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  MORPHO_LENDING_ROUTER_ADDRESS: string;
  NETWORK: Network;
  ALCHEMY_KEY: string;
  DD_API_KEY: string;
  DD_APP_KEY: string;
}

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS = 'exponent_liquidator.num_risky_accounts';
  public static readonly TOTAL_ACCOUNTS_PROCESSED = 'exponent_liquidator.total_accounts_processed';
}

// Vault configuration types
export enum VaultType {
  Staking = 'Staking',
  PendlePT = 'PendlePT', 
  CurveConvex2Token = 'CurveConvex2Token'
}

export interface OnChainVaultConfig {
  vaultType: VaultType;
  asset: string;
  yieldToken: string;
  primaryWrm: string;
  primaryWithdrawToken: string;
  secondaryWrm?: string;
  secondaryWithdrawToken?: string;
}

export interface OffChainVaultConfig {
  dexId?: number;
  depositExchangeData?: string;
  redeemExchangeData?: string;
  withdrawExchangeData?: string;
  depositPoolAddress?: string;
  redeemPoolAddress?: string;
  withdrawPoolAddress?: string;
  isPendlePT?: boolean;
  pointsMultipliers?: Record<string, number>;
  pointsLinks?: string;
}

export interface VaultConfig extends OnChainVaultConfig, OffChainVaultConfig {
  address: string;
}