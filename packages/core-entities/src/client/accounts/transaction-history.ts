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
import { AccountHistory } from '../../Definitions';

/***
 * Minting nToken => Provide Liquidity
 * Redeem nToken => Withdraw Liquidity + sum(nTokenResidualTransfer)
 * Transfer Incentive & Transfer Secondary Incentive => sum(to a single balance)
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

      // Inside each of these apply grouping logic....
      if (name === 'Mint nToken') {
        return g.map((_) => ({ ..._, label: 'Provide Liquidity' }));
        // } else if (name === 'Redeem nToken') {
        // } else if (name === 'fCash') {
        // } else if (name === 'pCash') {
        // } else if (
        //   name === 'Transfer Incentive' ||
        //   name === 'Transfer Secondary Incentive'
        // ) {
      } else {
        return g.map((_) => ({ ..._, label: _.bundleName }));
      }
    }
  );

  // then apply another transform on txn line items for:
  //   deleverage position
  //   leverage position
  //   roll debt or convert asset
  return txnLineItems.flatMap((_) => _);
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
    label: bundleName,
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
