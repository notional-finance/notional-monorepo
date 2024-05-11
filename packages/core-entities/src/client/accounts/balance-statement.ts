import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
  getNowSeconds,
} from '@notional-finance/util';
import { Registry } from '../../Registry';
import { TokenBalance } from '../../token-balance';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, Token } from '../../.graphclient';

export function parseCurrentBalanceStatement(
  current: BalanceSnapshot,
  _token: Token,
  network: Network
) {
  const tokens = Registry.getTokenRegistry();
  if (!_token.underlying) throw Error('Unknown underlying');
  const tokenId = _token.id;
  const token = tokens.getTokenByID(network, tokenId);
  const underlying = _token.underlying;
  const currentStatement = parseBalanceStatement(
    tokenId,
    underlying.id,
    current as BalanceSnapshot,
    network
  );

  const currentProfitAndLoss = currentStatement.balance
    .toUnderlying()
    .sub(
      currentStatement.adjustedCostBasis.scale(
        currentStatement.balance.n,
        INTERNAL_TOKEN_PRECISION
      )
    );

  const incentives =
    current.incentives?.map((i) => ({
      // PartOf: Incentive Earnings
      adjustedClaimed: TokenBalance.fromSymbol(
        i.adjustedClaimed,
        i.rewardToken.symbol,
        network
      ),
      totalClaimed: TokenBalance.fromSymbol(
        i.totalClaimed,
        i.rewardToken.symbol,
        network
      ),
    })) || [];

  let totalInterestAccrual: TokenBalance;
  if (token.tokenType === 'VaultShare' || token.tokenType === 'nToken') {
    const a = Registry.getOracleRegistry().getLatestFromSubject(
      network,
      `${token.underlying}:${token.id}:${
        token.tokenType === 'VaultShare'
          ? 'VaultShareInterestAccrued'
          : 'nTokenInterestAccrued'
      }`,
      0
    )?.latestRate;
    const interestAccumulator = a?.rate;
    if (interestAccumulator) {
      const currentInterestAccumulator = TokenBalance.fromID(
        interestAccumulator,
        underlying.id,
        network
      );
      const lastInterestAccumulator = TokenBalance.fromID(
        current._lastInterestAccumulator,
        underlying.id,
        network
      );
      const additionalAccruedInterest = currentInterestAccumulator
        .sub(lastInterestAccumulator)
        .scale(currentStatement.balance, currentStatement.balance.precision);
      totalInterestAccrual = currentStatement.totalInterestAccrual.add(
        additionalAccruedInterest
      );
      console.log(`
INTEREST: ${token.symbol}
Current Accumulator Time Diff: ${getNowSeconds() - a.timestamp}
Current Accumulator: ${currentInterestAccumulator.toDisplayStringWithSymbol(
        8,
        false,
        false
      )}
Last Accumulator: ${lastInterestAccumulator.toDisplayStringWithSymbol(
        8,
        false,
        false
      )}
Snapshot Interest: ${currentStatement.totalInterestAccrual.toDisplayStringWithSymbol(
        8,
        false,
        false
      )}
Additional Interest: ${additionalAccruedInterest.toDisplayStringWithSymbol(
        8,
        false,
        false
      )}
`);
    } else {
      console.log(`
INTEREST: ${token.symbol}
NO ACCUMULATOR FOUND
Snapshot Interest: ${currentStatement.totalInterestAccrual.toDisplayStringWithSymbol(
        8,
        false,
        false
      )}
`);
      totalInterestAccrual = currentStatement.totalInterestAccrual;
    }
  } else if (token.tokenType === 'fCash') {
    const lastInterestAccumulator = TokenBalance.fromID(
      current._lastInterestAccumulator,
      underlying.id,
      network
    );
    const additionalAccruedInterest = lastInterestAccumulator.scale(
      getNowSeconds() - currentStatement.timestamp,
      SECONDS_IN_YEAR
    );
    console.log(`
INTEREST: ${token.symbol}
Last Accumulator: ${lastInterestAccumulator.toDisplayStringWithSymbol(
      8,
      false,
      false
    )}
Snapshot Interest: ${currentStatement.totalInterestAccrual.toDisplayStringWithSymbol(
      8,
      false,
      false
    )}
Additional Interest: ${additionalAccruedInterest.toDisplayStringWithSymbol(
      8,
      false,
      false
    )}
`);
    totalInterestAccrual = currentStatement.totalInterestAccrual.add(
      additionalAccruedInterest
    );
  } else {
    // For Prime Cash and Prime Debt, the entire PNL is interest accrual
    totalInterestAccrual = currentProfitAndLoss;
  }

  // Total Earnings = Organic Earnings + Incentive Earnings
  return {
    token,
    blockNumber: current.blockNumber,
    underlying: tokens.getTokenByID(network, underlying.id),
    currentBalance: currentStatement.balance,
    adjustedCostBasis: currentStatement.adjustedCostBasis,
    // TODO: this is total fees but includes slippage....
    totalILAndFees: currentStatement.totalILAndFees,
    impliedFixedRate: currentStatement.impliedFixedRate,
    // Organic Earnings
    totalProfitAndLoss: currentProfitAndLoss,
    // Interest Accrued to Snapshot => Bring to Current
    totalInterestAccrual,
    // Amount Paid
    accumulatedCostRealized: currentStatement.accumulatedCostRealized,
    // TODO: Market PNL: Total Earnings - InterestAccrued
    incentives,
  };
}

export function parseBalanceStatement(
  tokenId: string,
  underlyingId: string,
  snapshot: BalanceSnapshot,
  network: Network
) {
  const balance = TokenBalance.fromID(
    snapshot.currentBalance,
    tokenId,
    network
  );

  const adjustedCostBasis = TokenBalance.fromID(
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
    totalILAndFees: TokenBalance.fromID(
      snapshot.totalILAndFeesAtSnapshot,
      underlyingId,
      network
    ),
    totalProfitAndLoss: TokenBalance.fromID(
      snapshot.totalProfitAndLossAtSnapshot,
      underlyingId,
      network
    ),
    totalInterestAccrual: TokenBalance.fromID(
      snapshot.totalInterestAccrualAtSnapshot,
      underlyingId,
      network
    ),
    impliedFixedRate: snapshot.impliedFixedRate
      ? (snapshot.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
  };
}
