import {
  Registry,
  TokenBalance,
  TokenDefinition,
  YieldData,
} from '@notional-finance/core-entities';
import {
  Network,
  PRODUCTS,
  RATE_PRECISION,
  SupportedNetworks,
  unique,
} from '@notional-finance/util';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalyticsReady, useAppContext } from './use-notional';
import { exchangeToLocalPrime } from '@notional-finance/transaction';

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

export function useAllUniqueUnderlyingTokens(
  networks: Network[] = SupportedNetworks
) {
  return unique(
    networks.flatMap((n) => {
      return Registry.getTokenRegistry()
        .getAllTokens(n)
        .filter(
          (t) => t.tokenType === 'Underlying' && t.currencyId !== undefined
        )
        .map((t) => t.symbol);
    })
  );
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

export function useMaxSupply(
  network: Network | undefined,
  currencyId: number | undefined
) {
  if (!network || !currencyId) return undefined;
  const { maxUnderlyingSupply, currentUnderlyingSupply, capacityRemaining } =
    Registry.getConfigurationRegistry().getMaxSupply(network, currencyId);
  return { maxUnderlyingSupply, currentUnderlyingSupply, capacityRemaining };
}

export function useYieldsReady(network: Network | undefined) {
  const {
    appState: { allYields: _allYields },
  } = useAppContext();
  return _allYields && network && _allYields[network] ? true : false;
}

export const useProductNetwork = (
  product: PRODUCTS,
  underlyingSymbol: string | undefined
) => {
  const tokens = Registry.getTokenRegistry();
  return SupportedNetworks.filter((n) => {
    if (
      product === PRODUCTS.LEND_FIXED ||
      product === PRODUCTS.LEND_LEVERAGED ||
      product === PRODUCTS.BORROW_FIXED ||
      product === PRODUCTS.LIQUIDITY_LEVERAGED ||
      product === PRODUCTS.LIQUIDITY_VARIABLE
    ) {
      return !!tokens
        .getAllTokens(n)
        .find(
          (t) =>
            t.tokenType === 'nToken' &&
            t.underlying &&
            tokens.getTokenByID(n, t.underlying).symbol === underlyingSymbol
        );
    } else if (product === PRODUCTS.BORROW_VARIABLE) {
      return !!tokens
        .getAllTokens(n)
        .find(
          (t) =>
            t.tokenType === 'PrimeDebt' &&
            t.underlying &&
            tokens.getTokenByID(n, t.underlying).symbol === underlyingSymbol
        );
    } else if (product === PRODUCTS.LEND_VARIABLE) {
      return !!tokens
        .getAllTokens(n)
        .find(
          (t) =>
            t.tokenType === 'PrimeCash' &&
            t.underlying &&
            tokens.getTokenByID(n, t.underlying).symbol === underlyingSymbol
        );
    } else {
      return false;
    }
  });
};

export const useAllNetworkMarkets = () => {
  const {
    appState: { allYields: _allYields },
  } = useAppContext();

  const earnYields = _allYields
    ? Object.keys(_allYields).flatMap((n) => {
        const yields = _allYields[n as Network];
        return [
          ...yields.liquidity,
          ...yields.fCashLend,
          ...yields.variableLend,
          ...yields.leveragedVaults,
          // ...yields.leveragedLend,
          ...yields.leveragedLiquidity,
        ];
      })
    : [];

  const borrowYields = _allYields
    ? Object.keys(_allYields).flatMap((n) => {
        const yields = _allYields[n as Network];
        return [...yields.fCashBorrow, ...yields.variableBorrow];
      })
    : [];

  return { earnYields, borrowYields };
};

export const useHeadlineRates = (network?: Network) => {
  const {
    appState: { allYields: _allYields },
  } = useAppContext();

  return useMemo(() => {
    const getMax = (y: YieldData[]) => {
      return y.reduce(
        (m, t) => (m === null || t.totalAPY > m.totalAPY ? t : m),
        null as YieldData | null
      );
    };

    const getMin = (y: YieldData[]) => {
      return y.reduce(
        (m, t) => (m === null || t.totalAPY < m.totalAPY ? t : m),
        null as YieldData | null
      );
    };

    // If a network is defined then use it, otherwise this returns values
    // across all networks
    const networks = network ? [network] : SupportedNetworks;
    const extractKey = (k: keyof NonNullable<typeof _allYields>[Network]) => {
      return networks.flatMap((n) =>
        _allYields && _allYields[n] ? _allYields[n][k] : []
      );
    };

    return {
      liquidity: getMax(extractKey('liquidity')),
      fCashLend: getMax(extractKey('fCashLend')),
      fCashBorrow: getMin(extractKey('fCashBorrow')),
      variableLend: getMax(extractKey('variableLend')),
      variableBorrow: getMin(extractKey('variableBorrow')),
      leveragedVaults: getMax(extractKey('leveragedVaults')),
      // leveragedLend: getMax(extractKey('leveragedLend')),
      leveragedLiquidity: getMax(extractKey('leveragedLiquidity')),
    };
  }, [_allYields, network]);
};

const emptyYields = {
  nonLeveragedYields: [],
  liquidity: [],
  fCashLend: [],
  fCashBorrow: [],
  variableLend: [],
  variableBorrow: [],
  vaultShares: [],
  leveragedVaults: [],
  leveragedLend: [],
  leveragedLiquidity: [],
};

export const useAllMarkets = (network: Network | undefined) => {
  const {
    appState: { allYields: _allYields },
  } = useAppContext();
  const allYields =
    _allYields && network ? _allYields[network] || emptyYields : emptyYields;

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

  return {
    yields: allYields,
    nonLeveragedYields: allYields['nonLeveragedYields'],
    getMax,
    getMin,
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
  try {
    return token && token.currencyId
      ? Registry.getExchangeRegistry().getfCashMarket(
          token.network,
          token.currencyId
        )
      : undefined;
  } catch {
    return undefined;
  }
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
        let spotRate =
          nonLeveragedYields.find((y) => y.token.id === _t.id)?.totalAPY || 0;
        if (
          _t.tokenType === 'PrimeDebt' &&
          t.tokenType === 'VaultDebt' &&
          t.vaultAddress
        ) {
          // Add the vault fee to the debt rate here
          spotRate +=
            (Registry.getConfigurationRegistry().getVaultConfig(
              t.network,
              t.vaultAddress
            ).feeRateBasisPoints *
              100) /
            RATE_PRECISION;
        }

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

export function useTradedValue(amount: TokenBalance | undefined) {
  const fCashMarket = useFCashMarket(amount?.token);
  const primeCash = usePrimeCash(amount?.network, amount?.currencyId);
  try {
    return primeCash
      ? exchangeToLocalPrime(
          amount,
          fCashMarket,
          primeCash
        ).localPrime.toUnderlying()
      : undefined;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function usePointPrices() {
  const analyticsReady = useAnalyticsReady(Network.all);
  const [pointPrices, setPointPrices] = useState<
    { points: string; price: number }[] | undefined
  >();

  useEffect(() => {
    if (analyticsReady && pointPrices === undefined) {
      Registry.getAnalyticsRegistry().getPointPrices().then(setPointPrices);
    }
  }, [analyticsReady, pointPrices]);

  return pointPrices;
}
