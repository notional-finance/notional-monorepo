import {
  Network,
  SECONDS_IN_DAY,
  floorToMidnight,
  getNowSeconds,
} from '@notional-finance/util';
import { TokenDefinition } from './Definitions';
import { TokenBalance } from './token-balance';
import { Registry } from './Registry';

export function getPointsPerDay(t: TokenBalance) {
  return (
    t.toUnderlying().abs().toFiat('USD').toFloat() *
    getArbBoosts(t.token, t.isNegative())
  );
}

export function getArbBoosts(b: TokenDefinition, isDebt: boolean) {
  if (b.network !== Network.arbitrum) return 0;

  if (b.tokenType === 'VaultShare') {
    // ezETH/wstETH
    if (b.vaultAddress === '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937')
      return 0;
    return 8;
  } else if (
    b.tokenType === 'PrimeDebt' ||
    (b.tokenType === 'PrimeCash' && isDebt)
  ) {
    // Variable Borrow
    if (b.currencyId === 2) return 4; // DAI
    if (b.currencyId === 3) return 4; // USDC
    if (b.currencyId === 6) return 4; // FRAX
    if (b.currencyId === 8) return 4; // USDT
  } else if (b.tokenType === 'fCash' && isDebt) {
    // Fixed Borrow
    if (b.currencyId === 2) return 4; // DAI
    if (b.currencyId === 3) return 4; // USDC
    if (b.currencyId === 6) return 4; // FRAX
    if (b.currencyId === 8) return 4; // USDT
  } else if (b.tokenType === 'PrimeCash' && !isDebt) {
    // Variable Lend
    if (b.currencyId === 1) return 2; // ETH
    if (b.currencyId === 3) return 2; // USDC

    if (b.currencyId === 8) return 1; // USDT
    if (b.currencyId === 2) return 1; // DAI
    if (b.currencyId === 6) return 1; // FRAX
    if (b.currencyId === 5) return 1; // wstETH
  } else if (b.tokenType === 'fCash' && !isDebt) {
    // Fixed Lend
    if (b.currencyId === 1) return 2; // ETH
    if (b.currencyId === 3) return 2; // USDC

    if (b.currencyId === 8) return 1; // USDT
    if (b.currencyId === 2) return 1; // DAI
    if (b.currencyId === 6) return 1; // FRAX
    if (b.currencyId === 5) return 1; // wstETH
  }

  return 0;
}

export function getPointsAPY(
  boost: number,
  currentTotalPoints: number,
  totalARB: number,
  seasonStart: Date,
  seasonEnd: Date
) {
  const totalARBPerSeason = TokenBalance.fromFloat(
    totalARB,
    Registry.getTokenRegistry().getTokenBySymbol(Network.arbitrum, 'ARB')
  );

  const daysIntoSeason = Math.floor(
    (floorToMidnight(getNowSeconds()) - seasonStart.getTime() / 1000) /
      SECONDS_IN_DAY
  );
  const daysLeftInSeason = Math.ceil(
    Math.max(seasonEnd.getTime() / 1000 - floorToMidnight(getNowSeconds()), 0) /
      SECONDS_IN_DAY
  );
  const dailyEmissionRate = currentTotalPoints / daysIntoSeason;
  const projectedPointTotal =
    currentTotalPoints + dailyEmissionRate * daysLeftInSeason;
  const pointsPerDollar = boost;
  const arbSharePerDollar = pointsPerDollar / projectedPointTotal;

  const dailyArbPerDollarInUSD =
    totalARBPerSeason.toFiat('USD').toFloat() * arbSharePerDollar;

  const result = dailyArbPerDollarInUSD * 365 * 100

  // TODO: remove this when we get the season two points calculating correctly
  return result > 0 ? result : 0;
}
