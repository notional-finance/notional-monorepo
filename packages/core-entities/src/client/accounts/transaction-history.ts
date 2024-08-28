import {
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
  groupArrayByKey,
} from '@notional-finance/util';
import { getNetworkModel } from '../../Models';
import { parseGraphBalanceToTokenBalance } from './balance-statement';
import { AccountHistory, TokenDefinition } from '../../Definitions';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ProfitLossLineItem, Transaction } from '../../.graphclient';

export function parseTransaction(
  t: Transaction,
  network: Network
): AccountHistory[] {
  const items =
    t.profitLossLineItems?.map((p) => parseLineItem(p, network)) || [];
  const txnLineItems = groupArrayByKey(items, ({ groupKey }) => groupKey)
    .map((g) => {
      const [_, name] = g[0].groupKey.split(':', 2);

      if (name === 'Redeem nToken') {
        const r = g.find(({ bundleName }) => bundleName === 'Redeem nToken');
        // It should always find r, but exit in the case that we do not
        if (!r) return g;

        // TODO: there is a bug where residuals are marked as non-transient if converting
        // from nTokens to fCash and vice versa since the fCash remains in the portfolio...
        // Update: underlyingAmountRealized and realizedPrice
        const w = g.reduce((acc, l) => {
          if (l.bundleName === 'nToken Residual Transfer') {
            acc.underlyingAmountRealized = acc.underlyingAmountRealized.add(
              l.underlyingAmountRealized
            );
          }

          return acc;
        }, r);

        // Recalculate the new realized price
        w.realizedPrice = w.underlyingAmountRealized.scale(
          w.tokenAmount.precision,
          w.tokenAmount.abs()
        );

        return w;
      } else if (
        name === 'Transfer Incentive' ||
        name === 'Transfer Secondary Incentive'
      ) {
        // Sum up all the incentive transfers into a single line item
        return g.reduce((acc, l, i) => {
          if (i > 0) acc.tokenAmount = acc.tokenAmount.add(l.tokenAmount);
          acc.underlyingAmountRealized = acc.tokenAmount;
          return acc;
        }, g[0]);
      } else {
        return g;
      }
    })
    .flatMap((_) => _);

  if (txnLineItems.length > 1) {
    let txnLabel: string | undefined;
    if (
      txnLineItems.find(({ label }) => label === 'Provide Liquidity') &&
      txnLineItems.find(({ label }) => label.startsWith('Borrow'))
    ) {
      txnLabel = 'Leveraged Liquidity';
    } else if (
      txnLineItems.find(({ label }) => label.startsWith('Lend')) &&
      txnLineItems.find(({ label }) => label.startsWith('Borrow'))
    ) {
      txnLabel = 'Leveraged Lend';
    } else if (
      txnLineItems.find(({ label }) => label === 'Withdraw Liquidity') &&
      txnLineItems.find(({ label }) => label.startsWith('Repay')) &&
      txnLineItems.find(({ label }) => label === 'Withdraw')
    ) {
      if (txnLineItems.find(({ label }) => label === 'Withdraw')) {
        txnLabel = 'Withdraw Leveraged Liquidity';
      } else {
        txnLabel = 'Deleverage Leveraged Liquidity';
      }
    } else if (
      txnLineItems.find(({ label }) => label.startsWith('Borrow')) &&
      txnLineItems.find(({ label }) => label.startsWith('Repay'))
    ) {
      txnLabel = 'Roll Debt';
    } else if (
      txnLineItems.find(({ label }) => label.startsWith('Lend')) &&
      txnLineItems.find(({ label }) => label.startsWith('Withdraw'))
    ) {
      txnLabel = 'Convert Asset';
    }

    return txnLineItems.map((l) => ({ ...l, txnLabel }));
  } else {
    return txnLineItems;
  }
}

function getLabelName(bundleName: string, token: TokenDefinition) {
  switch (bundleName) {
    case 'Mint nToken':
      return 'Provide Liquidity';
    case 'Redeem nToken':
      return 'Withdraw Liquidity';
    case 'Transfer Incentive':
      return 'Claim NOTE';
    case 'Transfer Secondary Incentive':
      return `Claim ${token.symbol}`;
    case 'Borrow fCash':
      return 'Borrow Fixed';
    case 'Repay fCash':
      return 'Repay Fixed';
    case 'Buy fCash':
      return 'Lend Fixed';
    case 'Sell fCash':
      return 'Withdraw Lend Fixed';
    case 'Borrow Prime Cash':
      return 'Borrow Variable';
    case 'Repay Prime Cash':
      return 'Repay Variable';
    default:
      return bundleName;
  }
}

export function parseLineItem(p: ProfitLossLineItem, network: Network) {
  const tokenId = p.token.id;
  const underlyingId = p.underlyingToken.id;
  const model = getNetworkModel(network);
  const token = model.getTokenByID(tokenId);
  const underlying = model.getTokenByID(underlyingId);

  const vaultName =
    !!token.vaultAddress && token.vaultAddress !== ZERO_ADDRESS
      ? model.getVaultName(token.vaultAddress)
      : undefined;

  let tokenAmount = parseGraphBalanceToTokenBalance(
    p.tokenAmount,
    tokenId,
    network
  );
  let underlyingAmountRealized = parseGraphBalanceToTokenBalance(
    p.underlyingAmountRealized,
    underlyingId,
    network
  );
  let underlyingAmountSpot = parseGraphBalanceToTokenBalance(
    p.underlyingAmountSpot,
    underlyingId,
    network
  );

  if (tokenAmount.tokenType === 'PrimeDebt') {
    tokenAmount = tokenAmount.neg();
    underlyingAmountRealized = underlyingAmountRealized.neg();
    underlyingAmountSpot = underlyingAmountSpot.neg();
  } else if (tokenAmount.tokenType === 'fCash' && token.isFCashDebt) {
    underlyingAmountRealized = underlyingAmountRealized.neg();
    underlyingAmountSpot = underlyingAmountSpot.neg();
  }

  const bundleName = p.bundle?.bundleName;
  let groupKey = `${underlying.id}:${bundleName}`;
  if (bundleName === 'nToken Residual Transfer') {
    groupKey = `${underlying.id}:Redeem nToken`;
  } else if (
    bundleName === 'Repay fCash' ||
    bundleName === 'Borrow fCash' ||
    bundleName === 'Buy fCash' ||
    bundleName === 'Sell fCash'
  ) {
    groupKey = `${token.id}:fCash`;
  } else if (
    bundleName === 'Borrow Prime Cash' ||
    bundleName === 'Repay Prime Cash' ||
    bundleName === 'Deposit' ||
    bundleName === 'Withdraw'
  ) {
    groupKey = `${underlying.id}:pCash`;
  }

  return {
    timestamp: p.timestamp,
    blockNumber: p.blockNumber,
    token,
    vaultName,
    underlying,
    bundleName,
    label: getLabelName(bundleName, token),
    transactionHash: p.transactionHash.id,
    tokenAmount,
    underlyingAmountRealized,
    underlyingAmountSpot,
    realizedPrice: parseGraphBalanceToTokenBalance(
      p.realizedPrice,
      underlyingId,
      network
    ),
    spotPrice: parseGraphBalanceToTokenBalance(
      p.spotPrice,
      underlyingId,
      network
    ),
    impliedFixedRate: p.impliedFixedRate
      ? (p.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
    isTransientLineItem: p.isTransientLineItem,
    groupKey,
    account: p.account.id,
  };
}
