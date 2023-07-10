import { useObservableState } from 'observable-hooks';
import { fCashMarket, Registry } from '@notional-finance/core-entities';
import { EMPTY } from 'rxjs';
import { useSelectedNetwork } from './use-notional';
import { useCallback, useMemo } from 'react';
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
        t.isFCashDebt === false &&
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
  const network = useSelectedNetwork();
  // TODO: rewrite this to be a subscription
  const allYields = network
    ? Registry.getYieldRegistry().getAllYields(network)
    : [];

  const getMax = useCallback((y: typeof allYields) => {
    return y.reduce(
      (m, t) => (m === null || t.totalAPY > m.totalAPY ? t : m),
      null as typeof allYields[0] | null
    );
  }, []);

  const getMin = useCallback((y: typeof allYields) => {
    return y.reduce(
      (m, t) => (m === null || t.totalAPY < m.totalAPY ? t : m),
      null as typeof allYields[0] | null
    );
  }, []);

  const yields = {
    liquidity: allYields.filter((y) => y.token.tokenType === 'nToken'),
    fCashLend: allYields.filter(
      (y) => y.token.tokenType === 'fCash' && y.leveraged === undefined
    ),
    fCashBorrow: allYields.filter(
      (y) => y.token.tokenType === 'fCash' && y.leveraged === undefined
    ),
    variableLend: allYields.filter((y) => y.token.tokenType === 'PrimeCash'),
    variableBorrow: allYields.filter((y) => y.token.tokenType === 'PrimeDebt'),
    leveragedVaults: allYields.filter(
      (y) => y.token.tokenType === 'VaultShare'
    ),
    leveragedLend: allYields.filter(
      (y) =>
        (y.token.tokenType === 'fCash' || y.token.tokenType === 'PrimeCash') &&
        !!y.leveraged
    ),
    leveragedLiquidity: allYields.filter(
      (y) => y.token.tokenType === 'nToken' && !!y.leveraged
    ),
  };

  const headlineRates = {
    liquidity: getMax(yields.liquidity),
    fCashLend: getMax(yields.fCashLend),
    fCashBorrow: getMin(yields.fCashLend),
    variableLend: getMax(yields.variableLend),
    variableBorrow: getMin(yields.variableBorrow),
    leveragedVaults: getMax(yields.leveragedVaults),
    leveragedLend: getMax(yields.leveragedLend),
    leveragedLiquidity: getMax(yields.leveragedLiquidity),
  };

  return { headlineRates, allYields, yields, getMax, getMin };
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
