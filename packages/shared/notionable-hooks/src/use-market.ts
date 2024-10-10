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

export function useVaultAdapter(vaultAddress: string | undefined) {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady() && vaultAddress
      ? currentNetworkStore.getVaultAdapter(vaultAddress)
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

// TODO: MOVE THIS INTO MOBX AND CACHE IN THE STORE
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

export const useSNOTEPool = () => {
  const currentNetworkStore = useCurrentNetworkStore();
  try {
    return currentNetworkStore.isReady()
      ? currentNetworkStore.getSNOTEPool()
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
