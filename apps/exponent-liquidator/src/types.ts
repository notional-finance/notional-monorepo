import { BigNumber } from 'ethers';
import { Network } from '@notional-finance/util';

export type Position = [string, string]; // [accountAddress, vaultAddress]

export type HealthFactorData = {
  account: string;
  vault: string;
  borrowed: BigNumber;
  collateralShares: BigNumber;
  maxBorrow: BigNumber;
};

export type RiskyPosition = {
  account: string;
  vault: string;
  borrowed: BigNumber;
  collateralShares: BigNumber;
  maxBorrow: BigNumber;
  healthFactor: number;
};

export type EnrichedPosition = RiskyPosition & {
  isWithdrawRequestPending: boolean;
  canWithdrawRequestFinalize: boolean;
  totalVaultShares: BigNumber;
  totalYieldTokens: BigNumber;
  primaryWithdrawTokenAmount?: BigNumber;
  secondaryWithdrawTokenAmount?: BigNumber;
};

export interface Env {
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  MORPHO_LENDING_ROUTER_ADDRESS: string;
  FLASH_LIQUIDATOR_ADDRESS: string;
  TRADING_MODULE_ADDRESS: string;
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
  // PendlePT specific tokens
  tokenOutSy?: string;
  marketAddress?: string;
  ptAddress?: string;
  // CurveConvex2Token specific tokens  
  token0?: string;
  token1?: string;
  primaryIndex?: number;
  // Exchange rate for converting shares to yield tokens
  shareToYieldTokenExchangeRate: BigNumber;
}

export interface OffChainVaultConfig {
  dexId?: number;
  depositExchangeData?: string;
  redeemExchangeData?: string;
  withdrawExchangeData?: string;
  depositPoolAddress?: string;
  redeemPoolAddress?: string;
  withdrawPoolAddress?: string;
  liquidateYieldTokens?: boolean;
  slippageLimit?: number;
  ptSlippageLimit?: number;
}

export interface VaultConfig extends OnChainVaultConfig, OffChainVaultConfig {
  address: string;
}

export interface WithdrawRequest {
  requestId: BigNumber;
  yieldTokenAmount: BigNumber;
  sharesAmount: BigNumber;
}

export interface TokenizedWithdrawRequest {
  totalYieldTokenAmount: BigNumber;
  totalWithdraw: BigNumber;
  finalized: boolean;
}

export interface WithdrawRequestData {
  withdrawRequest: WithdrawRequest;
  tokenizedWithdrawRequest: TokenizedWithdrawRequest;
}

export interface TokenPrice {
  token: string;
  price: BigNumber; // Price in base units (e.g., USD with 8 decimals)
  decimals: number;
}

// Pendle API types
export interface OrderType {
  salt: string;
  expiry: string;
  nonce: string;
  orderType: string;
  token: string;
  YT: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  lnImpliedRate: string;
  failSafeRate: string;
  permit: string;
}

export interface PendleApiResponse {
  contractCallParams: [
    string, // router
    string, // tokenIn
    string, // netTokenIn
    {
      eps: string;
      guessMax: string;
      guessMin: string;
      guessOffchain: string;
      maxIteration: string;
    }, // approxParams
    object, // swapData
    {
      epsSkipMarket: string;
      flashFills: {
        order: OrderType;
        signature: string;
        makingAmount: string;
      }[];
      normalFills: {
        order: OrderType;
        signature: string;
        makingAmount: string;
      }[];
      optData: string;
      limitRouter: string;
    } // limitOrderData
  ];
  data: {
    amountOut: string;
    priceImpact: number;
  };
}