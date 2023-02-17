import { MaturityData } from '../types';
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
  defaultVaultAction?: VAULT_ACTIONS;
  vaultAccountMaturityString?: string;
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
}

export const initialVaultActionState: VaultActionState = {
  hasError: false,
};
