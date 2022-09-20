import { gql } from '@apollo/client/core';

export interface VaultAccountResponse {
  leveragedVaultAccounts: {
    leveragedVault: {
      vaultAddress: string;
    };
    maturity: number;
    vaultShares: string;
    primaryBorrowfCash: string;
    secondaryBorrowDebtShares: [string, string] | null;
  }[];
}

export const VaultAccountQuery = gql`
  query getVaultAccounts($id: String!) {
    leveragedVaultAccounts(where: { account: $id }) {
      leveragedVault {
        vaultAddress
      }
      maturity
      vaultShares
      primaryBorrowfCash
      secondaryBorrowDebtShares
    }
  }
`;
