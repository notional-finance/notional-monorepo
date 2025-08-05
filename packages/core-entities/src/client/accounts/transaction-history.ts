import { Network, groupArrayByKey } from '@notional-finance/util';
import { getNetworkModel } from '../../Models';
import { parseGraphBalanceToTokenBalance } from './balance-statement';
import { AccountHistory } from '../../Definitions';
import {
  fetchGraph,
  loadGraphClientDeferred,
} from '../../server/server-registry';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ProfitLossLineItem } from '../../.graphclient';

export async function fetchTransactionHistory(
  network: Network,
  account: string,
  subgraphApiKey: string
) {
  const { AccountTransactionHistoryDocument } = await loadGraphClientDeferred();
  return await fetchGraph(
    network,
    AccountTransactionHistoryDocument,
    (r): Record<string, AccountHistory[]> => {
      return {
        [account]: groupArrayByKey(
          r.profitLossLineItems,
          (t) => t.transactionHash
        )
          // This is already sorted by timestamp?
          .map((t) => {
            return parseTransaction(t as ProfitLossLineItem[], network);
          })
          .flatMap((_) => _),
      };
    },
    subgraphApiKey,
    {
      accountId: account.toLowerCase(),
      skip: 0,
    },
    'profitLossLineItems'
  );
}

export function parseTransaction(
  t: ProfitLossLineItem[],
  network: Network
): AccountHistory[] {
  return t.map((p) => parseLineItem(p, network)) || [];
}

export function parseLineItem(p: ProfitLossLineItem, network: Network) {
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

  return {
    timestamp: p.timestamp,
    blockNumber: p.blockNumber,
    lineItemType: p.lineItemType,
    token,
    underlying,
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
    account: p.account.id,
  };
}
