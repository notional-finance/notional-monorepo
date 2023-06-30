import { useObservableState } from 'observable-hooks';
import {
  fCashMarket,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { EMPTY } from 'rxjs';
import { useSelectedNetwork } from './use-notional';
import { useMemo } from 'react';
import { getNowSeconds, isIdiosyncratic } from '@notional-finance/util';

export function useCurrency() {
  const network = useSelectedNetwork();
  return useMemo(() => {
    const allTokens = network
      ? Registry.getTokenRegistry().getAllTokens(network)
      : [];
    const depositTokens = allTokens.filter((t) => t.tokenType === 'Underlying');
    const primeCash = allTokens.filter((t) => t.tokenType === 'PrimeCash');
    const primeDebt = allTokens.filter((t) => t.tokenType === 'PrimeDebt');
    const fCash = allTokens.filter(
      (t) =>
        t.tokenType === 'fCash' &&
        t.maturity &&
        t.maturity > getNowSeconds() &&
        !isIdiosyncratic(t.maturity)
    );
    const nTokens = allTokens.filter((t) => t.tokenType === 'nToken');
    const vaultShares = allTokens.filter(
      (t) =>
        t.tokenType === 'VaultShare' &&
        t.maturity &&
        t.maturity > getNowSeconds() &&
        !isIdiosyncratic(t.maturity)
    );

    return {
      depositTokens,
      primeCash,
      primeDebt,
      fCash,
      nTokens,
      vaultShares,
      allTokens: depositTokens
        .concat(primeCash)
        .concat(primeDebt)
        .concat(fCash)
        .concat(nTokens)
        .concat(vaultShares),
    };
  }, [network]);
}

export const useAllMarkets = () => {
  const { allTokens } = useCurrency();

  const allYields = allTokens
    .filter((t) => t.tokenType !== 'Underlying')
    .map((t) => {
      const underlying = allTokens.find((t) => t.id === t.underlying);

      return {
        name: t.name,
        underlying: underlying?.symbol,
        tokenType: t.tokenType,
        maturity: t.maturity,
        isFixed: t.tokenType === 'fCash',
        // TODO: get data from registry...
        totalApy: 0,
        tvl: TokenBalance.zero(t).toUnderlying(),
        leverageRatio: t.tokenType === 'VaultShare' ? 5 : undefined,
        noteApy: 0,
      };
    });

  const getMax = (y: typeof allYields) => {
    return y.reduce(
      (m, t) => (m === null || t.totalApy > m.totalApy ? t : m),
      null as typeof allYields[0] | null
    );
  };

  const getMin = (y: typeof allYields) => {
    return y.reduce(
      (m, t) => (m === null || t.totalApy < m.totalApy ? t : m),
      null as typeof allYields[0] | null
    );
  };

  const headlineRates = {
    liquidity: getMax(allYields.filter((y) => y.tokenType === 'nToken')),
    fCashLend: getMax(allYields.filter((y) => y.tokenType === 'fCash')),
    fCashBorrow: getMin(allYields.filter((y) => y.tokenType === 'fCash')),
    variableLend: getMax(allYields.filter((y) => y.tokenType === 'PrimeCash')),
    variableBorrow: getMin(
      allYields.filter((y) => y.tokenType === 'PrimeDebt')
    ),
    leveragedVaults: getMax(
      allYields.filter((y) => y.tokenType === 'VaultShare')
    ),
    // TODO: how to fetch this?
    leveragedLend: null,
    leveragedLiquidity: null,
  };

  return { headlineRates, allTokens };
};

export const useFCashMarket = (currencyId?: number) => {
  const selectedNetwork = useSelectedNetwork();

  const nToken = useMemo(() => {
    try {
      return selectedNetwork
        ? Registry.getTokenRegistry().getNToken(selectedNetwork, currencyId)
        : undefined;
    } catch {
      return undefined;
    }
  }, [selectedNetwork, currencyId]);

  const fCashMarket$ = useMemo(() => {
    return selectedNetwork && nToken
      ? Registry.getExchangeRegistry().subscribePoolInstance<fCashMarket>(
          selectedNetwork,
          nToken.address
        )
      : undefined;
  }, [selectedNetwork, nToken]);

  return useObservableState<fCashMarket>(fCashMarket$ || EMPTY);
};
