import { gql } from '@apollo/client/core';
import { VaultAccountResponse } from './VaultAccountQuery';

export interface AssetResponse {
  currency: {
    id: string;
    symbol: string;
  };
  settlementDate: string;
  maturity: string;
  assetType: string;
  notional: number;
}

export interface BalanceResponse {
  currency: {
    id: string;
    symbol: string;
  };
  assetCashBalance: string;
  nTokenBalance: string;
  lastClaimTime: number;
  lastClaimIntegralSupply: string;
  accountIncentiveDebt: string;
  didMigrateIncentives: boolean;
}

export interface AccountResponse extends VaultAccountResponse {
  id: string;
  nextSettleTime: number;
  hasCashDebt: boolean;
  hasPortfolioAssetDebt: boolean;
  assetBitmapCurrency: {
    id: string;
  } | null;
  balances: BalanceResponse[];
  portfolio: AssetResponse[];
}

export type AccountQueryResponse = { account: AccountResponse };

export const AccountQuery = gql`
  query getAccount($id: String!) {
    account(id: $id) {
      id
      nextSettleTime
      hasCashDebt
      hasPortfolioAssetDebt
      assetBitmapCurrency {
        id
      }
      balances {
        currency {
          id
          symbol
        }
        assetCashBalance
        nTokenBalance
        lastClaimTime
        lastClaimIntegralSupply
        accountIncentiveDebt
        didMigrateIncentives
      }
      portfolio {
        currency {
          id
          symbol
        }
        settlementDate
        maturity
        assetType
        notional
      }
      leveragedVaultAccounts: leveragedVaults {
        leveragedVault {
          vaultAddress
        }
        maturity
        vaultShares
        primaryBorrowfCash
        secondaryBorrowDebtShares
      }
    }
  }
`;
