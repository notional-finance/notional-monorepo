import {
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
} from '@notional-finance/util';
import { Registry } from '../../Registry';
import { TokenBalance } from '../../token-balance';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, Token } from '../../.graphclient';

export function parseCurrentBalanceStatement(
  current: BalanceSnapshot,
  token: Token,
  network: Network
) {
  const tokens = Registry.getTokenRegistry();
  if (!token.underlying) throw Error('Unknown underlying');
  const tokenId = token.id;
  const underlying = token.underlying;
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
  const totalInterestAccrual = currentProfitAndLoss.sub(
    currentStatement.totalILAndFees
  );
  const incentives =
    current.incentives?.map((i) => ({
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

  return {
    token: tokens.getTokenByID(network, tokenId),
    blockNumber: current.blockNumber,
    underlying: tokens.getTokenByID(network, underlying.id),
    currentBalance: currentStatement.balance,
    adjustedCostBasis: currentStatement.adjustedCostBasis,
    totalILAndFees: currentStatement.totalILAndFees,
    impliedFixedRate: currentStatement.impliedFixedRate,
    totalProfitAndLoss: currentProfitAndLoss,
    totalInterestAccrual,
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
