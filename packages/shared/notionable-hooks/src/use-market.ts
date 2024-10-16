import {
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, PRODUCTS, RATE_PRECISION } from '@notional-finance/util';
import { useEffect, useMemo } from 'react';
import { exchangeToLocalPrime } from '@notional-finance/transaction';
import {
  useCurrentNetworkStore,
  usePortfolioStore,
} from '@notional-finance/notionable';
import { useObserver } from 'mobx-react-lite';

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

export const useProductNetwork = (
  product: PRODUCTS,
  underlyingSymbol: string | undefined
) => {
  const portfolioStore = usePortfolioStore();
  return portfolioStore.getNetworksForProduct(product, underlyingSymbol);
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
        const _t = currentNetworkStore.unwrapVaultToken(t);
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
            (currentNetworkStore.getVaultConfig(t.vaultAddress)
              .feeRateBasisPoints *
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
  }, [tokens, currentNetworkStore, nonLeveragedYields]);
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

export function useFetchAnalyticsData(
  id: string,
  isLoaded: boolean,
  network: Network | undefined
) {
  useEffect(() => {
    if (!isLoaded && network)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getNetworkModel(network).fetchAnalyticsData(id as any);
  }, [id, isLoaded, network]);
}

export function usePointPrices() {
  const pointPrices = useObserver(() => {
    return getNetworkModel(Network.all).getPointPrices();
  });
  useFetchAnalyticsData('pointPrices', !!pointPrices, Network.all);
  return pointPrices;
}
