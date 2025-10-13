import { Network } from '@notional-finance/util';
import { getNetworkModel } from '../../Models';
import { parseGraphBalanceToTokenBalance } from './balance-statement';
import { AccountHistory } from '../../Definitions';
import {
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from '../../server/server-registry';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { IncentiveSnapshot, ProfitLossLineItem } from '../../.graphclient';

export async function fetchTransactionHistory(
  network: Network,
  account: string,
  subgraphApiKey: string
) {
  const {
    AccountTransactionHistoryDocument,
    AccountIncentiveSnapshotsDocument,
  } = await loadGraphClientDeferred();
  const profitLossResult = await fetchGraphPaginate(
    network,
    AccountTransactionHistoryDocument,
    'profitLossLineItems',
    subgraphApiKey,
    {
      accountId: account.toLowerCase(),
      skip: 0,
    }
  );
  const profitLossLineItems =
    profitLossResult.data?.profitLossLineItems.map((p: ProfitLossLineItem) =>
      parseLineItem(p, network)
    ) || [];

  const incentiveSnapshotsResult = await fetchGraphPaginate(
    network,
    AccountIncentiveSnapshotsDocument,
    'incentiveSnapshots',
    subgraphApiKey,
    { accountId: account.toLowerCase(), skip: 0 }
  );
  const incentiveSnapshots =
    incentiveSnapshotsResult.data?.incentiveSnapshots.map(
      (i: IncentiveSnapshot) => parseIncentiveSnapshot(i, network)
    ) || [];

  return incentiveSnapshots.concat(profitLossLineItems);
}

export function parseIncentiveSnapshot(
  i: IncentiveSnapshot,
  network: Network
): AccountHistory {
  const model = getNetworkModel(network);
  const rewardToken = model.getTokenByID(i.rewardToken.id);
  const amountClaimed = parseGraphBalanceToTokenBalance(
    i.amountClaimed,
    rewardToken.id,
    network
  );

  return {
    timestamp: i.timestamp,
    blockNumber: i.blockNumber,
    transactionHash: i.transactionHash,
    vaultAddress: i.balanceSnapshot.balance.token.vaultAddress as string,
    lineItemType: 'Rewards Claimed',
    lineItemLabel: `Rewards Claimed: ${rewardToken.symbol}`,
    properties: [
      {
        key: `${rewardToken.symbol} Claimed`,
        value: amountClaimed.toDisplayString(4, true, false),
      },
    ],
  };
}

export function parseLineItem(
  p: ProfitLossLineItem,
  network: Network
): AccountHistory {
  const tokenId = p.token.id;
  const underlyingId = p.underlyingToken.id;
  const model = getNetworkModel(network);
  const token = model.getTokenByID(tokenId);
  const underlying = model.getTokenByID(underlyingId);

  const tokenAmount = parseGraphBalanceToTokenBalance(
    p.tokenAmount,
    tokenId,
    network
  );
  const underlyingAmountRealized = parseGraphBalanceToTokenBalance(
    p.underlyingAmountRealized,
    underlyingId,
    network
  );
  const underlyingAmountSpot = parseGraphBalanceToTokenBalance(
    p.underlyingAmountSpot,
    underlyingId,
    network
  );

  let lineItemLabel = 'Unknown';
  let properties: { key: string; value: string }[] = [];

  if (
    p.lineItemType === 'EnterPosition' ||
    p.lineItemType === 'ExitPosition' ||
    p.lineItemType === 'LiquidatePosition' ||
    p.lineItemType === 'MigratePosition'
  ) {
    if (token.tokenType === 'VaultShare') {
      lineItemLabel =
        p.lineItemType === 'EnterPosition'
          ? 'Mint Vault Shares'
          : p.lineItemType === 'ExitPosition'
          ? 'Burn Vault Shares'
          : p.lineItemType === 'LiquidatePosition'
          ? 'Liquidate Vault Shares'
          : 'Migrate Vault Shares';

      properties = [
        {
          key: 'Value',
          value: underlyingAmountSpot.toDisplayStringWithSymbol(4, true, false),
        },
        {
          key: 'Entry Price',
          value: underlyingAmountRealized.toDisplayStringWithSymbol(
            4,
            true,
            false
          ),
        },
        {
          key: 'Vault Shares',
          value: tokenAmount.toDisplayString(4, true, false),
        },
      ];
      if (p.yieldTokenAmount && token.vaultAddress) {
        const yieldToken = model.getYieldToken(token.vaultAddress);
        const yieldTokenAmount = parseGraphBalanceToTokenBalance(
          p.yieldTokenAmount,
          yieldToken.id,
          network
        );
        properties.push({
          key: `${yieldTokenAmount.symbol} Amount`,
          value: yieldTokenAmount.toDisplayString(4, true, false),
        });
      }
    } else if (token.tokenType === 'VaultDebt') {
      lineItemLabel =
        p.lineItemType === 'EnterPosition'
          ? 'Borrow Vault Debt'
          : p.lineItemType === 'ExitPosition'
          ? 'Repay Vault Debt'
          : p.lineItemType === 'LiquidatePosition'
          ? 'Repay Vault Debt'
          : 'Migrate Vault Debt';
      properties = [
        {
          key: 'Value',
          value: underlyingAmountSpot.toDisplayStringWithSymbol(4, true, false),
        },
        {
          key: 'Entry Price',
          value: underlyingAmountRealized.toDisplayStringWithSymbol(
            4,
            true,
            false
          ),
        },
        {
          key: 'Vault Debt Shares',
          value: tokenAmount.toDisplayString(4, true, false),
        },
      ];
    }
  } else if (p.lineItemType === 'WithdrawRequest') {
    // Token is vault share, underlying is yield token
    lineItemLabel = 'Withdraw Request';
    properties = [
      {
        key: 'Vault Shares Burned',
        value: tokenAmount.toDisplayString(4, true, false),
      },
      {
        key: `${token.symbol} Withdrawn`,
        value: underlyingAmountRealized.toDisplayString(4, true, false),
      },
    ];
  } else if (p.lineItemType === 'WithdrawRequestFinalized') {
    // Token is yield token, underlying is withdraw token
    lineItemLabel = 'Withdraw Request Finalized';
    properties = [
      {
        key: `${token.symbol} Burned`,
        value: tokenAmount.toDisplayString(4, true, false),
      },
      {
        key: `${underlying.symbol} Received`,
        value: underlyingAmountRealized.toDisplayString(4, true, false),
      },
    ];
  } else if (p.lineItemType === 'TradeExecution') {
    lineItemLabel = `Trade: ${p.token.symbol} → ${p.underlyingToken.symbol}`;
    const realizedPrice = parseGraphBalanceToTokenBalance(
      p.realizedPrice,
      underlyingId,
      network
    );

    properties = [
      {
        key: `${p.token.symbol} Sold`,
        value: tokenAmount.toDisplayString(4, true, false),
      },
      {
        key: `${p.underlyingToken.symbol} Bought`,
        value: underlyingAmountRealized.toDisplayString(4, true, false),
      },
      {
        key: 'Price',
        value: realizedPrice.toDisplayStringWithSymbol(4, true, false),
      },
    ];
  }

  return {
    timestamp: p.timestamp,
    vaultAddress: p.balanceSnapshot.balance.token.vaultAddress as string,
    blockNumber: p.blockNumber,
    transactionHash: p.transactionHash,
    lineItemType: p.lineItemType,
    lineItemLabel,
    properties,
  };
}
