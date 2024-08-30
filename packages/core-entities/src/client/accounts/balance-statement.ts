import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
  // SCALAR_PRECISION,
  // SECONDS_IN_YEAR,
  // getNowSeconds,
} from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';
// import { BigNumber } from 'ethers';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, Token } from '../../.graphclient';
import { getNetworkModel } from '../../Models';
import { BigNumberish, BigNumber } from 'ethers';

/**
 * Subgraph stores PrimeDebt balances as positive numbers so need to flip the sign here, fCash and vault debt
 * balances are handled inside the TokenBalance constructor
 */
export function parseGraphBalanceToTokenBalance(
  balance: BigNumberish,
  tokenId: string,
  network: Network
) {
  const model = getNetworkModel(network);
  const isPrimeDebt = model.getTokenByID(tokenId).tokenType === 'PrimeDebt';
  let b = BigNumber.from(balance);
  if (isPrimeDebt && b.gt(0)) b = b.mul(-1);

  return new TokenBalance(balance, tokenId, network);
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
      adjustedClaimed: getNetworkModel(network).getTokenBalanceFromSymbol(
        i.adjustedClaimed,
        i.rewardToken.symbol
      ),
      totalClaimed: getNetworkModel(network).getTokenBalanceFromSymbol(
        i.totalClaimed,
        i.rewardToken.symbol
      ),
    })) || [];

  const totalInterestAccrual: TokenBalance = currentProfitAndLoss;
  /*
  FIXME: add this back in for earnings breakdown
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
    // This interest accumulator is always in 18 decimals
    const currentInterestAccumulator = a?.rate;
    if (currentInterestAccumulator) {
      const additionalAccruedInterest = TokenBalance.unit(underlying)
        .scale(
          currentInterestAccumulator.sub(
            current._lastInterestAccumulator as BigNumber
          ),
          SCALAR_PRECISION
        )
        .scale(currentStatement.balance, currentStatement.balance.precision);

      totalInterestAccrual = currentStatement.totalInterestAccrual.add(
        additionalAccruedInterest
      );
    } else {
      totalInterestAccrual = currentStatement.totalInterestAccrual;
    }
  } else if (token.tokenType === 'fCash') {
    const lastInterestAccumulator = TokenBalance.from(
      current._lastInterestAccumulator,
      underlying
    );
    const additionalAccruedInterest = lastInterestAccumulator.scale(
      getNowSeconds() - currentStatement.timestamp,
      SECONDS_IN_YEAR
    );
    totalInterestAccrual = currentStatement.totalInterestAccrual.add(
      additionalAccruedInterest
    );
    if (currentStatement.balance.isNegative())
      totalInterestAccrual = totalInterestAccrual.neg();
  } else {
    // For Prime Cash and Prime Debt, the entire PNL is interest accrual
    totalInterestAccrual = currentProfitAndLoss;
  }
  */

  // Total Earnings = Organic Earnings + Incentive Earnings
  return {
    token,
    blockNumber: current.blockNumber,
    underlying,
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
    incentives,
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
    totalILAndFees: new TokenBalance(
      snapshot.totalILAndFeesAtSnapshot,
      underlyingId,
      network
    ),
    totalProfitAndLoss: new TokenBalance(
      snapshot.totalProfitAndLossAtSnapshot,
      underlyingId,
      network
    ),
    totalInterestAccrual: new TokenBalance(
      snapshot.totalInterestAccrualAtSnapshot,
      underlyingId,
      network
    ),
    impliedFixedRate: snapshot.impliedFixedRate
      ? (snapshot.impliedFixedRate * 100) / RATE_PRECISION
      : undefined,
  };
}
