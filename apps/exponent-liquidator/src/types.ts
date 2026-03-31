import { BigNumber } from 'ethers';
import { Network } from '@notional-finance/util';

export type Position = [string, string]; // [accountAddress, vaultAddress]

export type HealthFactorData = {
  account: string;
  vault: string;
  borrowed: BigNumber;
  maxBorrow: BigNumber;
  healthFactor: number;
};

export type RiskyPosition = {
  account: string;
  vault: string;
  borrowed: BigNumber;
  maxBorrow: BigNumber;
  healthFactor: number;
  borrowShares: BigNumber;
};

export type RiskyPositionWithoutBorrowShares = Omit<
  RiskyPosition,
  'borrowShares'
>;

export type EnrichedPosition = RiskyPosition & {
  isWithdrawRequestPending: boolean;
  canWithdrawRequestFinalize: boolean;
  collateralShares: BigNumber;
  primaryWithdrawTokenAmount?: BigNumber;
  secondaryWithdrawTokenAmount?: BigNumber;
  accountVaultSharePrice: BigNumber;
};

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  gasLimit?: number;
  to?: string;
  type?: 'liquidation' | 'forceWithdraw';
}

export interface LiquidationReport {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  transactionResults: TransactionResult[];
}

export interface LiquidationRunResult {
  positionsToLiquidate: EnrichedPosition[];
  liquidationReport: LiquidationReport;
  enrichedPositions: EnrichedPosition[];
}

export interface Env {
  MORPHO_LENDING_ROUTER_ADDRESS: string;
  FLASH_LIQUIDATOR_ADDRESS: string;
  TRADING_MODULE_ADDRESS: string;
  NETWORK: Network;
  TX_RELAY_AUTH_TOKEN: string;
  HYPERNATIVE_CLIENT_ID: string;
  HYPERNATIVE_CLIENT_SECRET: string;
  LOG_LEVEL: 'info' | 'debug';
}

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS =
    'exponent_liquidator.num_risky_accounts';
  public static readonly TOTAL_ACCOUNTS_PROCESSED =
    'exponent_liquidator.total_accounts_processed';
}

// Vault configuration types
export enum VaultType {
  Staking = 'Staking',
  PendlePT = 'PendlePT',
  CurveConvex2Token = 'CurveConvex2Token',
  MidasStaking = 'MidasStaking',
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
  // Liquidation incentive factor for the vault
  liquidationIncentiveFactor: BigNumber;
}

export interface OffChainVaultConfig {
  dexId?: number;
  redeemExchangeData?: string;
  withdrawExchangeData?: string;
  withdrawPoolAddress?: string;
  liquidateYieldTokens?: boolean;
  slippageLimit?: number;
  ptSlippageLimit?: number;
  primaryWithdrawDexId?: number;
  primaryWithdrawExchangeData?: string;
  secondaryWithdrawDexId?: number;
  secondaryWithdrawExchangeData?: string;
  vaultAssetEqualsWithdrawToken?: boolean;
  autoForceWithdraw?: boolean;
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

export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltv: BigNumber;
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

export interface ConvertResponse {
  routes: {
    contractParamInfo: {
      contractCallParams: [
        string,
        string,
        string,
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
    };
    data: {
      priceImpact: number;
    };
    outputs: {
      amount: string;
      token: string;
    }[];
  }[];
}
