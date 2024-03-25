import { YieldData } from '@notional-finance/core-entities';
import { Network, PRODUCTS } from '@notional-finance/util';

export function getIndexedYields(network: Network, allYields: YieldData[]) {
  const nonLeveragedYields = allYields.filter((y) => y.leveraged === undefined);

  return {
    nonLeveragedYields,
    liquidity: nonLeveragedYields
      .filter((y) => y.token.tokenType === 'nToken')
      .map((y) => {
        return {
          ...y,
          product: 'Provide Liquidity',
          link: `${PRODUCTS.LIQUIDITY_VARIABLE}/${network}/${y.underlying.symbol}`,
        };
      }),
    fCashLend: nonLeveragedYields
      .filter((y) => y.token.tokenType === 'fCash')
      .map((y) => {
        return {
          ...y,
          product: 'Fixed Lend',
          link: `${PRODUCTS.LEND_FIXED}/${network}/${y.underlying.symbol}`,
        };
      }),
    fCashBorrow: nonLeveragedYields
      .filter((y) => y.token.tokenType === 'fCash')
      .map((y) => {
        return {
          ...y,
          product: 'Fixed Borrow',
          link: `${PRODUCTS.BORROW_FIXED}/${network}/${y.underlying.symbol}`,
        };
      }),
    variableLend: nonLeveragedYields
      .filter((y) => y.token.tokenType === 'PrimeCash')
      .map((y) => {
        return {
          ...y,
          product: 'Variable Lend',
          link: `${PRODUCTS.LEND_VARIABLE}/${network}/${y.underlying.symbol}`,
        };
      }),
    variableBorrow: nonLeveragedYields
      .filter((y) => y.token.tokenType === 'PrimeDebt')
      .map((y) => {
        return {
          ...y,
          product: 'Variable Borrow',
          link: `${PRODUCTS.BORROW_VARIABLE}/${network}/${y.underlying.symbol}`,
        };
      }),
    vaultShares: nonLeveragedYields.filter(
      (y) => y.token.tokenType === 'VaultShare'
    ),
    leveragedVaults: allYields
      .filter((y) => y.token.tokenType === 'VaultShare' && !!y.leveraged)
      .map((y) => {
        return {
          ...y,
          product: 'Leveraged Vault',
          link: `${PRODUCTS.VAULTS}/${network}`,
        };
      }),
    // leveragedLend: allYields
    //   .filter(
    //     (y) =>
    //       (y.token.tokenType === 'fCash' ||
    //         y.token.tokenType === 'PrimeCash') &&
    //       !!y.leveraged
    //   )
    //   .map((y) => {
    //     return {
    //       ...y,
    //       product: 'Leveraged Lend',
    //       link: `${PRODUCTS.LEND_LEVERAGED}/${network}/${y.underlying.symbol}`,
    //     };
    //   }),
    leveragedLiquidity: allYields
      .filter((y) => y.token.tokenType === 'nToken' && !!y.leveraged)
      .map((y) => {
        return {
          ...y,
          product: 'Leveraged Liquidity',
          link: `${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/${y.underlying.symbol}`,
        };
      }),
  };
}
