import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  PRODUCTS,
  RATE_PRECISION,
  SupportedNetworks,
  unique,
} from '@notional-finance/util';
import { useEffect, useMemo, useState } from 'react';
import { useAnalyticsReady } from './use-notional';
import { exchangeToLocalPrime } from '@notional-finance/transaction';
import { useCurrentNetworkStore } from '@notional-finance/notionable';

export interface MaturityData {
  token: TokenDefinition;
  tokenId: string;
  tradeRate: number | undefined;
  maturity: number;
}

export function useNToken(currencyId: number | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady()
      ? currentNetworkStore.getNToken(currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function usePrimeCash(currencyId: number | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady()
      ? currentNetworkStore.getPrimeCash(currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function useToken(tokenId: string | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady() && tokenId
      ? currentNetworkStore.getTokenByID(tokenId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function usePrimeDebt(currencyId: number | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady()
      ? currentNetworkStore.getPrimeDebt(currencyId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function useAllUniqueUnderlyingTokens() {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady()
      ? unique(
          currentNetworkStore
            .getAllTokens()
            .filter(
              (t) => t.tokenType === 'Underlying' && t.currencyId !== undefined
            )
            .map((t) => t.symbol)
        )
      : [];
  } catch {
    return undefined;
  }
}

export function usePrimeTokens() {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    if (currentNetworkStore.isReady()) {
      const allTokens = currentNetworkStore.getAllTokens();
      return {
        primeCash: allTokens.filter((t) => t.tokenType === 'PrimeCash'),
        primeDebt: allTokens.filter((t) => t.tokenType === 'PrimeDebt'),
      };
    } else {
      return undefined;
    }
  } catch {
    return undefined;
  }
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

// NOTE: I don't think is needed anymore since we don't have to wait for yields to load before rendering since that's
// handled by mobx now

// export function useYieldsReady(network: Network | undefined) {
//   const {
//     appState: { allYields: _allYields },
//   } = useAppContext();
//   return _allYields && network && _allYields[network] ? true : false;
// }

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

/** This is used to generate the utilization charts */
export const useNotionalMarket = (token: TokenDefinition | undefined) => {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady() && token && token.currencyId
      ? currentNetworkStore.getNotionalMarket(token?.currencyId)
      : undefined;
  } catch {
    return undefined;
  }
};

export const useFCashMarket = (token?: TokenDefinition | undefined) => {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady() && token && token.currencyId
      ? currentNetworkStore.getfCashMarket(token?.currencyId)
      : undefined;
  } catch {
    return undefined;
  }
};

export const useSpotMaturityData = (
  tokens: TokenDefinition[] | undefined
): MaturityData[] => {
  const currentNetworkStore = useCurrentNetworkStore();
  const nonLeveragedYields = currentNetworkStore.getAllNonLeveragedYields();

  return useMemo(() => {
    return (
      tokens?.map((t) => {
        const _t = Registry.getTokenRegistry().unwrapVaultToken(t);
        let spotRate =
          nonLeveragedYields.find((y) => y.token.id === _t.id)?.apy.totalAPY ||
          0;
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
  const primeCash = usePrimeCash(amount?.currencyId);
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
