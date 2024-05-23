import { TokenBalance } from '@notional-finance/core-entities';

export function getArbBoosts(b: TokenBalance) {
  if (b.tokenType === 'VaultShare') {
    return 8;
  } else if (
    b.tokenType === 'PrimeDebt' ||
    (b.tokenType === 'PrimeCash' && b.isNegative())
  ) {
    // Variable Borrow
    if (b.underlying.symbol === 'USDC') return 4;
    if (b.underlying.symbol === 'USDT') return 4;
    if (b.underlying.symbol === 'FRAX') return 4;
    if (b.underlying.symbol === 'DAI') return 4;
  } else if (b.tokenType === 'fCash' && b.isNegative()) {
    // Fixed Borrow
    if (b.underlying.symbol === 'USDC') return 4;
    if (b.underlying.symbol === 'USDT') return 4;
    if (b.underlying.symbol === 'FRAX') return 4;
    if (b.underlying.symbol === 'DAI') return 4;
  } else if (b.tokenType === 'PrimeCash' && b.isPositive()) {
    // Variable Lend
    if (b.underlying.symbol === 'USDC') return 2;
    if (b.underlying.symbol === 'ETH') return 2;
    if (b.underlying.symbol === 'USDT') return 1;
    if (b.underlying.symbol === 'DAI') return 1;
    if (b.underlying.symbol === 'FRAX') return 1;
    if (b.underlying.symbol === 'wstETH') return 1;
  } else if (b.tokenType === 'fCash' && b.isPositive()) {
    // Fixed Lend
    if (b.underlying.symbol === 'USDC') return 2;
    if (b.underlying.symbol === 'ETH') return 2;
    if (b.underlying.symbol === 'USDT') return 1;
    if (b.underlying.symbol === 'DAI') return 1;
    if (b.underlying.symbol === 'FRAX') return 1;
    if (b.underlying.symbol === 'wstETH') return 1;
  }

  return 0;
}
