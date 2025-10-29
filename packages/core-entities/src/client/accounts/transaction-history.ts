import {
  camelCaseToReadable,
  getEtherscanTransactionLink,
  groupArrayByKey,
  Network,
  shortenTokenSymbol,
} from '@notional-finance/util';
import { getNetworkModel } from '../../Models';
import { parseGraphBalanceToTokenBalance } from './balance-statement';
import {
  AccountHistory,
  AccountTransactions,
  TokenDefinition,
} from '../../Definitions';
import {
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from '../../server/server-registry';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { IncentiveSnapshot, ProfitLossLineItem } from '../../.graphclient';
import { TokenBalance } from '../../token-balance';

export async function fetchTransactionHistory(
  network: Network,
  account: string,
  subgraphApiKey: string
): Promise<Record<string, AccountTransactions[]>> {
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

  const allLineItems = incentiveSnapshots.concat(profitLossLineItems);

  return {
    [account.toLowerCase()]: groupIntoTransactions(allLineItems, network),
  };
}

function groupIntoTransactions(
  lineItems: (AccountHistory & { underlyingAmountRealized: TokenBalance })[],
  network: Network
): AccountTransactions[] {
  const model = getNetworkModel(network);
  const grouped = groupArrayByKey(lineItems, (i) => i.transactionHash)
    .map((g) => {
      const transactionType =
        g.find(
          (i) =>
            i.lineItemType !== 'Rewards Claimed' &&
            i.lineItemType !== 'Trade Execution'
        )?.lineItemType || 'Rewards Claimed';
      const config = model.getVaultConfig(g[0].vaultAddress);
      let amountToFromWallet: TokenBalance | undefined;
      const zero = TokenBalance.zero(config.depositToken as TokenDefinition);
      if (transactionType === 'EnterPosition') {
        const sharesValue =
          g.find((i) => i.lineItemLabel === 'Mint Vault Shares')
            ?.underlyingAmountRealized || zero;
        const borrowValue =
          g.find((i) => i.lineItemLabel === 'Borrow Vault Debt')
            ?.underlyingAmountRealized || zero;
        amountToFromWallet = sharesValue.sub(borrowValue);
      } else if (transactionType === 'ExitPosition') {
        const sharesValue =
          g.find((i) => i.lineItemLabel === 'Burn Vault Shares')
            ?.underlyingAmountRealized || zero;
        const borrowValue =
          g.find((i) => i.lineItemLabel === 'Repay Vault Debt')
            ?.underlyingAmountRealized || zero;
        amountToFromWallet = sharesValue.sub(borrowValue);
      }

      return {
        timestamp: g[0].timestamp,
        vaultAddress: g[0].vaultAddress,
        blockNumber: g[0].blockNumber,
        transactionHash: {
          hash: g[0].transactionHash,
          href: getEtherscanTransactionLink(g[0].transactionHash, network),
        },
        transactionType: {
          symbol: config.depositToken.symbol,
          label: camelCaseToReadable(transactionType),
          caption: config.name,
        },
        lineItems: g,
        amountToFromWallet,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return grouped;
}

function parseIncentiveSnapshot(
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
    vaultAddress: i.balance.token.vaultAddress?.id || '',
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

function parseLineItem(
  p: ProfitLossLineItem,
  network: Network
): AccountHistory & { underlyingAmountRealized: TokenBalance } {
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
  const realizedPrice = parseGraphBalanceToTokenBalance(
    p.realizedPrice,
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
          value: underlyingAmountRealized.toDisplayStringWithSymbol(
            4,
            true,
            false
          ),
        },
        {
          key: 'Entry Price',
          value: realizedPrice.toDisplayStringWithSymbol(4, true, false),
        },
        {
          key: 'Vault Shares',
          value: tokenAmount.abs().toDisplayString(4, true, false),
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
          key: `${shortenTokenSymbol(yieldToken.symbol)} Amount`,
          value: yieldTokenAmount.abs().toDisplayString(4, true, false),
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
          value: underlyingAmountRealized.toDisplayStringWithSymbol(
            4,
            true,
            false
          ),
        },
        {
          key: 'Entry Price',
          value: realizedPrice.toDisplayStringWithSymbol(4, true, false),
        },
        {
          key: 'Debt Shares',
          value: tokenAmount.abs().toDisplayString(4, true, false),
        },
      ];
    }
  } else if (p.lineItemType === 'WithdrawRequest') {
    // Token is vault share, underlying is yield token
    lineItemLabel = 'Withdraw Request';
    properties = [
      {
        key: 'Vault Shares Burned',
        value: tokenAmount.abs().toDisplayString(4, true, false),
      },
      {
        key: `${shortenTokenSymbol(underlying.symbol)} Withdrawn`,
        value: underlyingAmountRealized.toDisplayString(4, true, false),
      },
    ];
  } else if (p.lineItemType === 'WithdrawRequestFinalized') {
    // Token is yield token, underlying is withdraw token
    lineItemLabel = 'Withdraw Request Finalized';
    properties = [
      {
        key: `${shortenTokenSymbol(token.symbol)} Burned`,
        value: tokenAmount.abs().toDisplayString(4, true, false),
      },
      {
        key: `${shortenTokenSymbol(underlying.symbol)} Received`,
        value: underlyingAmountRealized.toDisplayString(4, true, false),
      },
    ];
  } else if (p.lineItemType === 'TradeExecution') {
    lineItemLabel = `Trade: ${shortenTokenSymbol(
      p.underlyingToken.symbol
    )} → ${shortenTokenSymbol(p.token.symbol)}`;
    properties = [
      {
        key: `${shortenTokenSymbol(p.underlyingToken.symbol)} Sold`,
        value: underlyingAmountRealized.abs().toDisplayString(4, true, false),
      },
      {
        key: `${shortenTokenSymbol(p.token.symbol)} Bought`,
        value: tokenAmount.toDisplayString(4, true, false),
      },
      {
        key: 'Price',
        value: realizedPrice.toDisplayStringWithSymbol(4, true, false),
      },
    ];
  }

  return {
    timestamp: p.timestamp,
    vaultAddress: p.balanceSnapshot.balance.token.vaultAddress?.id || '',
    blockNumber: p.blockNumber,
    transactionHash: p.transactionHash,
    lineItemType: p.lineItemType,
    underlyingAmountRealized,
    lineItemLabel,
    properties,
  };
}
