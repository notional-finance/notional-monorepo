import { gql } from '@apollo/client/core';
import { AccountResponse } from './AccountQuery';

export type BatchAccountResponse = AccountResponse[];

export const BatchAccountQuery = gql`
  query batchQuery($pageSize: Int!, $lastID: String) {
    batch: accounts(first: $pageSize, where: { id_gt: $lastID }, orderBy: id, orderDirection: asc) {
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
      leveragedVaults {
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
