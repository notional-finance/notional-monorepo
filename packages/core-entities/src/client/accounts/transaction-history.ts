import {
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
  groupArrayByKey,
} from '@notional-finance/util';
import { Registry } from '../../Registry';
import { TokenBalance } from '../../token-balance';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ProfitLossLineItem, Transaction } from '../../.graphclient';
import { AccountHistory, TokenDefinition } from '../../Definitions';

/***
 * Borrow fCash / Prime Debt [PREFER] =>
 *    Borrow fCash => Borrow Fixed (hide sell fcash)
 *    Repay fCash => Repay Fixed (hide buy fcash)
 * Lend fCash / Prime Cash =>
 *    Buy fCash => Lend Fixed
 *    Sell fCash => Withdraw Lend Fixed
 */

export function parseTransaction(
  t: Transaction,
  network: Network
): AccountHistory[] {
  const items =
    t.profitLossLineItems?.map((p) => parseLineItem(p, network)) || [];
  const txnLineItems = groupArrayByKey(items, ({ groupKey }) => groupKey).map(
    (g) => {
      const [_, name] = g[0].groupKey.split(':', 2);

      if (name === 'Redeem nToken') {
        const r = g.find(({ bundleName }) => bundleName === 'Redeem nToken');
        // It should always find r, but exit in the case that we do not
        if (!r) return g;

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
        // } else if (name === 'fCash') {
        // } else if (name === 'pCash') {
      } else {
        return g;
      }
    }
  );

  // then apply another transform on txn line items for:
  //   deleverage position
  //   leverage position
  //   roll debt or convert asset
  return txnLineItems.flatMap((_) => _);
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
    default:
      return bundleName;
  }
}

export function parseLineItem(p: ProfitLossLineItem, network: Network) {
  const tokenId = p.token.id;
  const underlyingId = p.underlyingToken.id;
  const token = Registry.getTokenRegistry().getTokenByID(network, tokenId);
  const vaultName =
    !!token.vaultAddress && token.vaultAddress !== ZERO_ADDRESS
      ? Registry.getConfigurationRegistry().getVaultName(
          token.network,
          token.vaultAddress
        )
      : undefined;

  let tokenAmount = TokenBalance.fromID(p.tokenAmount, tokenId, network);
  let underlyingAmountRealized = TokenBalance.fromID(
    p.underlyingAmountRealized,
    underlyingId,
    network
  );
  let underlyingAmountSpot = TokenBalance.fromID(
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

  const underlying = Registry.getTokenRegistry().getTokenByID(
    network,
    underlyingId
  );
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
    realizedPrice: TokenBalance.fromID(p.realizedPrice, underlyingId, network),
    spotPrice: TokenBalance.fromID(p.spotPrice, underlyingId, network),
    impliedFixedRate: p.impliedFixedRate
      ? (p.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
    isTransientLineItem: p.isTransientLineItem,
    groupKey,
  };
}
