import { MaturityData, TransactionFunction } from '../types';
import {
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
  VaultConfig,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';

export enum NoEligibleMarketsReason {
  IsIdiosyncratic,
  MaturedNotSettled,
}

export enum VaultError {
  VaultConfigNotFound,
  ErrorCalculatingWithdraw,
}

export interface HistoricalReturn {
  timestamp: number;
  totalRate: number;
  breakdown: string[];
  leveragedReturn?: number;
}

export interface ReturnDriver {
  source: string;
  shortAvg: string;
  longAvg: string;
}

/** These inputs come externally */
interface VaultInputs {
  // Relevant on all screens
  vaultAction?: VAULT_ACTIONS;
  // Relevant on create and roll position
  selectedMarketKey?: string;
  // Relevant on create, increase, roll, and deposit
  depositAmount?: TypedBigNumber;
  // Relevant on create, increase, roll, withdraw and repay debt
  leverageRatio?: number;
  // Relevant on withdraw
  withdrawAmount?: TypedBigNumber;
  maxWithdraw?: boolean;
}

/** These values are calculated on init, when either the account or vault changes */
interface VaultInitData {
  primaryBorrowCurrency?: number;
  primaryBorrowSymbol?: string;
  minBorrowSize?: string;
  minAccountBorrowSize?: TypedBigNumber;
  strategyName?: string;

  // Calculate Init Data
  accountAddress?: string;
  eligibleMarkets?: Market[];
  eligibleActions?: VAULT_ACTIONS[];
  vaultAddress?: string;
  vaultAccount?: VaultAccount;
  vaultConfig?: VaultConfig;
  baseVault?: GenericBaseVault;
  settledVaultValues?: {
    strategyTokens: TypedBigNumber;
    assetCash: TypedBigNumber;
  };
  noEligibleMarketsReason?: NoEligibleMarketsReason;
  minLeverageRatio?: number;
  maxLeverageRatio?: number;
  maxWithdrawAmount?: TypedBigNumber;
  priorAvgBorrowRate?: number;
  totalCashBorrowed?: TypedBigNumber;
}

interface VaultReturnsData {
  historicalReturns?: HistoricalReturn[];
  returnDrivers?: ReturnDriver[];
  sevenDayAverageReturn?: number;
}

export interface VaultActionState
  extends VaultInputs,
    VaultInitData,
    VaultReturnsData,
    Record<string, unknown> {
  // Calculated Borrow Data
  borrowMarketData?: MaturityData[];
  fCashBorrowAmount?: TypedBigNumber;
  cashBorrowed?: TypedBigNumber;
  currentBorrowRate?: number;

  // Calculated Withdraw Data
  fCashToLend?: TypedBigNumber;
  vaultSharesToRedeem?: TypedBigNumber;
  amountToWallet?: TypedBigNumber;
  costToRepay?: TypedBigNumber;

  transactionCosts?: TypedBigNumber;

  // Calculated Account Data
  maximumLeverageRatio?: number;
  minimumLeverageRatio?: number;
  updatedVaultAccount?: VaultAccount;
  vaultError?: VaultError;
  buildTransactionCall?: TransactionFunction;
  netCapacityChange?: TypedBigNumber;

  error?: VaultError;
  isReady: boolean;
}

export const initialVaultActionState: VaultActionState = {
  isReady: true,
};
