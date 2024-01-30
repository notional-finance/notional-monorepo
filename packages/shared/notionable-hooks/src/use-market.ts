import {
  Registry,
  TokenDefinition,
  YieldData,
} from '@notional-finance/core-entities';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useCallback, useMemo } from 'react';
import { useNotionalContext } from './use-notional';

export interface MaturityData {
  token: TokenDefinition;
  tokenId: string;
  tradeRate: number | undefined;
  maturity: number;
}

export function useNToken(
  network: Network | undefined,
  currencyId: number | undefined
) {
  try {
    return network
      ? Registry.getTokenRegistry().getNToken(network, currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function usePrimeCash(
  network: Network | undefined,
  currencyId: number | undefined
) {
  try {
    return network
      ? Registry.getTokenRegistry().getPrimeCash(network, currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function useToken(
  network: Network | undefined,
  tokenId: string | undefined
) {
  try {
    return network && tokenId
      ? Registry.getTokenRegistry().getTokenByID(network, tokenId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function usePrimeDebt(
  network: Network | undefined,
  currencyId: number | undefined
) {
  try {
    return network
      ? Registry.getTokenRegistry().getPrimeDebt(network, currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function useUnderlyingTokens(network: Network | undefined) {
  const allTokens = network
    ? Registry.getTokenRegistry().getAllTokens(network)
    : [];
  return allTokens.filter(
    (t) => t.tokenType === 'Underlying' && t.currencyId !== undefined
  );
}

export function usePrimeTokens(network: Network | undefined) {
  const allTokens = network
    ? Registry.getTokenRegistry().getAllTokens(network)
    : [];
  return {
    primeCash: allTokens.filter((t) => t.tokenType === 'PrimeCash'),
    primeDebt: allTokens.filter((t) => t.tokenType === 'PrimeDebt'),
  };
}

// TODO: this needs more refactoring....
export const useAllMarkets = (network: Network | undefined) => {
  const {
    globalState: { allYields: _allYields },
  } = useNotionalContext();
  
  const allYields = _allYields && network && _allYields[network] ? _allYields[network] : [];
  
  const getMax = useCallback((y: YieldData[]) => {
    return y.reduce(
      (m, t) => (m === null || t.totalAPY > m.totalAPY ? t : m),
      null as YieldData | null
    );
  }, []);

  const getMin = useCallback((y: YieldData[]) => {
    return y.reduce(
      (m, t) => (m === null || t.totalAPY < m.totalAPY ? t : m),
      null as YieldData | null
    );
  }, []);
  const nonLeveragedYields = allYields.filter((y) => y.leveraged === undefined);

  const yields = {
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
          link: `${PRODUCTS.LEVERAGED_VAULT}/${network}/${y.underlying.symbol}`,
        };
      }),
    leveragedLend: allYields
      .filter(
        (y) =>
          (y.token.tokenType === 'fCash' ||
            y.token.tokenType === 'PrimeCash') &&
          !!y.leveraged
      )
      .map((y) => {
        return {
          ...y,
          product: 'Leveraged Lend',
          link: `${PRODUCTS.LEND_LEVERAGED}/${network}/${y.underlying.symbol}`,
        };
      }),
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

  const earnYields = [
    ...yields.liquidity,
    ...yields.fCashLend,
    ...yields.variableLend,
    ...yields.leveragedVaults,
    ...yields.leveragedLend,
    ...yields.leveragedLiquidity,
  ];

  const borrowYields = [...yields.fCashBorrow, ...yields.variableBorrow];

  const headlineRates = {
    liquidity: getMax(yields.liquidity),
    fCashLend: getMax(yields.fCashLend),
    fCashBorrow: getMin(yields.fCashBorrow),
    variableLend: getMax(yields.variableLend),
    variableBorrow: getMin(yields.variableBorrow),
    leveragedVaults: getMax(yields.leveragedVaults),
    leveragedLend: getMax(yields.leveragedLend),
    leveragedLiquidity: getMax(yields.leveragedLiquidity),
  };

  return {
    headlineRates,
    allYields,
    yields,
    getMax,
    getMin,
    earnYields: earnYields,
    borrowYields: borrowYields,
    nonLeveragedYields,
  };
};

/** This is used to generate the utilization charts */
export const useNotionalMarket = (token: TokenDefinition | undefined) => {
  return token && token.currencyId
    ? Registry.getExchangeRegistry().getNotionalMarket(
        token.network,
        token.currencyId
      )
    : undefined;
};

export const useFCashMarket = (token?: TokenDefinition | undefined) => {
  return token && token.currencyId
    ? Registry.getExchangeRegistry().getfCashMarket(
        token.network,
        token.currencyId
      )
    : undefined;
};

export const useSpotMaturityData = (
  tokens: TokenDefinition[] | undefined,
  selectedNetwork: Network | undefined
): MaturityData[] => {
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);

  return useMemo(() => {
    return (
      tokens?.map((t) => {
        const _t = Registry.getTokenRegistry().unwrapVaultToken(t);
        const spotRate =
          nonLeveragedYields.find((y) => y.token.id === _t.id)?.totalAPY || 0;

        return {
          token: t,
          tokenId: t.id,
          tradeRate: spotRate,
          maturity: t.maturity || 0,
        };
      }) || []
    );
  }, [tokens, nonLeveragedYields]);
};
