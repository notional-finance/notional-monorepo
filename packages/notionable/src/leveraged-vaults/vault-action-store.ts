import { MaturityData } from '../types';
import {
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
  VaultConfig,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { PopulatedTransaction } from 'ethers';

// @todo resolve this circular dependency by getting rid of notionable from shared-trade
interface TransactionFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionFn: (...args: any) => Promise<PopulatedTransaction>;
  transactionArgs: unknown[];
}

export enum NoEligibleMarketsReason {
  IsIdiosyncratic,
  MaturedNotSettled,
}

export enum VaultError {
  VaultConfigNotFound,
  ErrorCalculatingWithdraw,
}

/** These inputs come externally */
interface VaultInputs {
  // Relevant on all screens
  vaultAction?: VAULT_ACTIONS;
  hasError: boolean;
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
}

export interface VaultActionState
  extends VaultInputs,
    VaultInitData,
    Record<string, unknown> {
  // Calculated Borrow Data
  borrowMarketData?: MaturityData[];
  fCashBorrowAmount?: TypedBigNumber;
  currentBorrowRate?: number;

  // Calculated Withdraw Data
  fCashToLend?: TypedBigNumber;
  vaultSharesToRedeem?: TypedBigNumber;
  amountToWallet?: TypedBigNumber;

  // Calculated Account Data
  maximumLeverageRatio?: number;
  minimumLeverageRatio?: number;
  updatedVaultAccount?: VaultAccount;
  maxWithdrawAmount?: TypedBigNumber;
  vaultError?: VaultError;
  buildTransactionCall?: TransactionFunction;
  netCapacityChange?: TypedBigNumber;
}

export const initialVaultActionState: VaultActionState = {
  hasError: false,
};
