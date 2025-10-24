import {
  Network,
  RATE_PRECISION,
  SCALAR_PRECISION,
  getNowSeconds,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';

import { getNetworkModel } from '../../Models';
import { fetchGraph } from '../../server/server-registry';
import { BigNumberish, BigNumber } from 'ethers';
import { loadGraphClientDeferred } from '../../server/server-registry';
import { BalanceStatement, HistoricalBalance } from '../../Definitions';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, Token } from '../../.graphclient';

export async function fetchHistoricalBalances(
  network: Network,
  account: string,
  subgraphApiKey: string,
  minTimestamp = getNowSeconds() - 30 * SECONDS_IN_DAY
) {
  const { AccountHoldingsHistoricalDocument } = await loadGraphClientDeferred();
  return await fetchGraph(
    network,
    AccountHoldingsHistoricalDocument,
    (r): Record<string, HistoricalBalance[]> => {
      // These are the balances of any tokens that do not have
      // a snapshot in the time range (meaning their balance did)
      // not change during the time span
      const current =
        r.account?.balances
          ?.filter(({ current }) => current.timestamp < minTimestamp)
          .map(({ current, token }) => ({
            timestamp: current.timestamp,
            balance: parseGraphBalanceToTokenBalance(
              current.currentBalance,
              token.id,
              network
            ),
          })) || [];

      const snapshots =
        r.account?.balances?.flatMap(({ snapshots, token }) => {
          return (
            snapshots?.map(({ timestamp, currentBalance }) => ({
              timestamp,
              balance: parseGraphBalanceToTokenBalance(
                currentBalance,
                token.id,
                network
              ),
            })) || []
          );
        }) || [];

      return {
        [account]: snapshots
          .concat(current)
          .sort((a, b) => a.timestamp - b.timestamp),
      };
    },
    subgraphApiKey,
    {
      accountId: account.toLowerCase(),
      minTimestamp,
    }
  );
}

export async function fetchBalanceStatements(
  network: Network,
  account: string,
  subgraphApiKey: string
) {
  const { AccountBalanceStatementDocument } = await loadGraphClientDeferred();
  return await fetchGraph(
    network,
    AccountBalanceStatementDocument,
    (r): Record<string, BalanceStatement[]> => {
      return {
        [account]:
          r.account?.balances
            ?.filter(({ token }) => !!token.underlying)
            .map(({ current, token, incentives }) => {
              if (!token.underlying) throw Error('Unknown underlying');
              const model = getNetworkModel(network);

              return {
                ...parseCurrentBalanceStatement(
                  current as BalanceSnapshot,
                  token as Token,
                  network
                ),
                incentives:
                  incentives?.map((i) => ({
                    totalClaimed: model.getTokenBalanceFromSymbol(
                      i.totalClaimed,
                      i.rewardToken.symbol
                    ),
                    adjustedClaimed: model.getTokenBalanceFromSymbol(
                      i.adjustedClaimed,
                      i.rewardToken.symbol
                    ),
                  })) || [],
              };
            }) || [],
      };
    },
    subgraphApiKey,
    {
      accountId: account.toLowerCase(),
    }
  );
}

/**
 * Subgraph stores debt balances as positive numbers so need to flip the sign here
 */
export function parseGraphBalanceToTokenBalance(
  balance: BigNumberish,
  tokenId: string,
  network: Network
) {
  const model = getNetworkModel(network);
  const isDebt = model.getTokenByID(tokenId).tokenType === 'VaultDebt';
  let b = BigNumber.from(balance);
  if (isDebt && b.gt(0)) b = b.mul(-1);

  return new TokenBalance(b, tokenId, network);
}

export function parseCurrentBalanceStatement(
  current: BalanceSnapshot,
  _token: Token,
  network: Network
) {
  if (!_token.underlying) throw Error('Unknown underlying');
  const tokenId = _token.id;
  const model = getNetworkModel(network);
  const token = model.getTokenByID(tokenId);
  const underlying = model.getTokenByID(_token.underlying.id);

  const currentStatement = parseBalanceStatement(
    tokenId,
    underlying.id,
    current as BalanceSnapshot,
    network
  );

  let currentProfitAndLoss = currentStatement.balance
    .toUnderlying()
    .sub(
      currentStatement.adjustedCostBasis.scale(
        currentStatement.balance.n,
        currentStatement.balance.precision
      )
    );

  let totalInterestAccrual: TokenBalance = currentProfitAndLoss;

  if (token.tokenType === 'VaultShare') {
    const additionalAccruedInterest = model
      .getVaultAdapter(token.id)
      .getAdditionalAccruedInterest(currentStatement);
    totalInterestAccrual = currentStatement.totalInterestAccrual.add(
      additionalAccruedInterest
    );
  } else if (token.tokenType === 'VaultDebt') {
    currentProfitAndLoss = currentProfitAndLoss.neg();
    // For vault debt, the entire PNL is interest accrual
    totalInterestAccrual = currentProfitAndLoss;
  }

  // Total Earnings = Organic Earnings + Incentive Earnings
  return {
    token,
    blockNumber: current.blockNumber,
    underlying,
    currentBalance: currentStatement.balance,
    adjustedCostBasis: currentStatement.adjustedCostBasis,
    impliedFixedRate: currentStatement.impliedFixedRate,
    // Organic Earnings
    totalProfitAndLoss: currentProfitAndLoss,
    // Interest Accrued to Snapshot => Bring to Current
    totalInterestAccrual,
    // Amount Paid
    accumulatedCostRealized: currentStatement.accumulatedCostRealized,
    totalVaultFees: currentStatement.totalVaultFeesAtSnapshot,
  };
}

export function parseBalanceStatement(
  tokenId: string,
  underlyingId: string,
  snapshot: BalanceSnapshot,
  network: Network
) {
  const balance = new TokenBalance(snapshot.currentBalance, tokenId, network);

  const adjustedCostBasis = new TokenBalance(
    snapshot.adjustedCostBasis,
    underlyingId,
    network
  );
  const accumulatedCostRealized = adjustedCostBasis.scale(
    balance,
    balance.precision
  );
  return {
    balance,
    adjustedCostBasis,
    timestamp: snapshot.timestamp,
    accumulatedCostRealized,
    lastInterestAccumulator: BigNumber.from(snapshot._lastInterestAccumulator),
    totalProfitAndLoss: new TokenBalance(
      snapshot.currentProfitAndLossAtSnapshot,
      underlyingId,
      network
    ),
    totalInterestAccrual: new TokenBalance(
      snapshot.totalInterestAccrualAtSnapshot,
      underlyingId,
      network
    ),
    totalVaultFeesAtSnapshot: new TokenBalance(
      snapshot.totalVaultFeesAtSnapshot,
      underlyingId,
      network
    ),
    impliedFixedRate: snapshot.impliedFixedRate
      ? (snapshot.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
  };
}
