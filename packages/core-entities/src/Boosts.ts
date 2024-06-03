import { TokenDefinition } from './Definitions';

export function getArbBoosts(b: TokenDefinition, isDebt: boolean) {
  if (b.tokenType === 'VaultShare') {
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
