import { createObservableContext } from '@notional-finance/notionable-hooks';
import { MaturityData } from '@notional-finance/notionable';
import {
  GenericBaseVault,
  TypedBigNumber,
  VaultAccount,
  VaultConfig,
} from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { MessageDescriptor } from 'react-intl';

export interface VaultActionState {
  selectedMarketKey?: string;
  hasError: boolean;
  leverageRatio?: number;
  vaultAction?: VAULT_ACTIONS;
  depositAmount?: TypedBigNumber;
  // Calculated Maturity Data
  vaultMaturityData?: MaturityData[];
  fCashBorrowAmount?: TypedBigNumber;
  currentBorrowRate?: number;
  // Calculated Account Data
  minimumLeverageRatio?: number;
  updatedVaultAccount?: VaultAccount;
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
  noEligibleMarketsReason?: MessageDescriptor;
  defaultVaultAction?: VAULT_ACTIONS;
  vaultAccountMaturityString?: string;
}

export const initialVaultActionState: VaultActionState = {
  hasError: false,
};

export const VaultActionContext = createObservableContext<VaultActionState>(
  'vault-action-context',
  initialVaultActionState
);
