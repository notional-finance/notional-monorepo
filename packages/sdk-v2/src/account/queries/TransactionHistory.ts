import { gql } from '@apollo/client/core';

export interface BalanceHistoryResponse {
  id: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  currency: {
    id: string;
  };
  assetCashBalanceBefore: string;
  assetCashBalanceAfter: string;
  assetCashValueUnderlyingBefore: string;
  assetCashValueUnderlyingAfter: string;
  nTokenBalanceBefore: string;
  nTokenBalanceAfter: string;
  nTokenValueUnderlyingBefore: string;
  nTokenValueUnderlyingAfter: string;
  nTokenValueAssetBefore: string;
  nTokenValueAssetAfter: string;
}

export interface TradeHistoryResponse {
  id: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  currency: {
    id: string;
  };
  market: {
    marketIndex: number;
    maturity: number;
    settlementDate: number;
    marketMaturityLengthSeconds: number;
  } | null;
  tradeType: string;
  netAssetCash: string;
  netUnderlyingCash: string;
  netfCash: string;
  netLiquidityTokens: string | null;
  maturity: string;
}

export interface StakedNoteResponse {
  id: string;
  sNOTEBalance: string;
  ethAmountJoined: string;
  noteAmountJoined: string;
  ethAmountRedeemed: string;
  noteAmountRedeemed: string;

  stakedNoteChanges: {
    blockNumber: number;
    transactionHash: string;
    timestamp: number;
    sNOTEAmountBefore: string;
    sNOTEAmountAfter: string;
    ethAmountChange: string;
    noteAmountChange: string;
  }[];
}

export interface LeveragedVaultHistoryResponse {
  id: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  vaultTradeType: string;
  leveragedVault: {
    vaultAddress: string;
  };
  leveragedVaultMaturityBefore: {
    maturity: number;
  } | null;
  leveragedVaultMaturityAfter: {
    maturity: number;
  } | null;
  primaryBorrowfCashBefore: string;
  primaryBorrowfCashAfter: string;
  netPrimaryBorrowfCashChange: string | null;
  vaultSharesBefore: string;
  vaultSharesAfter: string;
  netVaultSharesChange: string | null;
  secondaryDebtSharesBefore: string[] | null;
  secondaryDebtSharesAfter: string[] | null;
  netSecondaryDebtSharesChange: string[] | null;
  netUnderlyingCash: string | null;
}

export interface TransactionHistoryResponse {
  trades: TradeHistoryResponse[];
  balanceChanges: BalanceHistoryResponse[];
  stakedNoteBalance: StakedNoteResponse | null;
  leveragedVaultTrades: LeveragedVaultHistoryResponse[];
}

export const TransactionHistoryQuery = gql`
  query getTransactionHistory($id: String!) {
    trades(where: { account: $id }, orderBy: blockNumber, orderDirection: asc) {
      id
      blockNumber
      transactionHash
      timestamp
      currency {
        id
      }
      market {
        marketIndex
        maturity
        settlementDate
        marketMaturityLengthSeconds
      }
      tradeType
      netAssetCash
      netUnderlyingCash
      netfCash
      netLiquidityTokens
      maturity
    }

    balanceChanges(where: { account: $id }, orderBy: blockNumber, orderDirection: asc) {
      id
      blockNumber
      transactionHash
      timestamp
      currency {
        id
      }
      assetCashBalanceBefore
      assetCashBalanceAfter
      assetCashValueUnderlyingBefore
      assetCashValueUnderlyingAfter
      nTokenBalanceBefore
      nTokenBalanceAfter
      nTokenValueUnderlyingBefore
      nTokenValueUnderlyingAfter
      nTokenValueAssetBefore
      nTokenValueAssetAfter
    }

    stakedNoteBalance(id: $id) {
      sNOTEBalance
      ethAmountJoined
      noteAmountJoined
      ethAmountRedeemed
      noteAmountRedeemed

      stakedNoteChanges(orderBy: blockNumber, orderDirection: asc) {
        id
        blockNumber
        transactionHash
        timestamp
        sNOTEAmountBefore
        sNOTEAmountAfter
        ethAmountChange
        noteAmountChange
      }
    }

    leveragedVaultTrades(where: { account: $id }, orderBy: blockNumber, orderDirection: asc) {
      id
      blockNumber
      transactionHash
      timestamp
      vaultTradeType
      leveragedVault {
        vaultAddress
      }
      leveragedVaultMaturityBefore {
        maturity
      }
      leveragedVaultMaturityAfter {
        maturity
      }
      primaryBorrowfCashBefore
      primaryBorrowfCashAfter
      netPrimaryBorrowfCashChange
      vaultSharesBefore
      vaultSharesAfter
      netVaultSharesChange
      secondaryDebtSharesBefore
      secondaryDebtSharesAfter
      netSecondaryDebtSharesChange
      netUnderlyingCash
    }
  }
`;
