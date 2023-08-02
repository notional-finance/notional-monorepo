import { useObservableState } from 'observable-hooks';
import {
  fCashMarket,
  Registry,
  TokenDefinition,
  YieldData,
} from '@notional-finance/core-entities';
import { EMPTY } from 'rxjs';
import { PRODUCTS } from '@notional-finance/shared-config';
import { useSelectedNetwork } from './use-notional';
import { useCallback, useMemo } from 'react';
import {
  formatInterestRate,
  getNowSeconds,
  isIdiosyncratic,
} from '@notional-finance/util';

export interface MaturityData {
  token: TokenDefinition;
  tokenId: string;
  tradeRate: number | undefined;
  maturity: number;
  hasLiquidity: boolean;
  tradeRateString: string;
}

export function useCurrency() {
  const network = useSelectedNetwork();
  return useMemo(() => {
    const allTokens = network
      ? Registry.getTokenRegistry().getAllTokens(network)
      : [];
    const depositTokens = allTokens.filter(
      (t) => t.tokenType === 'Underlying' && t.currencyId !== undefined
    );
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

  const yields = {
    liquidity: allYields
      .filter(
        (y) => y.token.tokenType === 'nToken' && y.leveraged === undefined
      )
      .map((y) => {
        return {
          ...y,
          product: 'Provide Liquidity',
          link: `${PRODUCTS.LIQUIDITY_VARIABLE}/${y.underlying.symbol}`,
        };
      }),
    fCashLend: allYields
      .filter((y) => y.token.tokenType === 'fCash' && y.leveraged === undefined)
      .map((y) => {
        return {
          ...y,
          product: 'Fixed Lend',
          link: `${PRODUCTS.LEND_FIXED}/${y.underlying.symbol}`,
        };
      }),
    fCashBorrow: allYields
      .filter((y) => y.token.tokenType === 'fCash' && y.leveraged === undefined)
      .map((y) => {
        return {
          ...y,
          product: 'Fixed Borrow',
          link: `${PRODUCTS.BORROW_FIXED}/${y.underlying.symbol}`,
        };
      }),
    variableLend: allYields
      .filter(
        (y) => y.token.tokenType === 'PrimeCash' && y.leveraged === undefined
      )
      .map((y) => {
        return {
          ...y,
          product: 'Variable Lend',
          link: `${PRODUCTS.LEND_VARIABLE}/${y.underlying.symbol}`,
        };
      }),
    variableBorrow: allYields
      .filter((y) => y.token.tokenType === 'PrimeDebt')
      .map((y) => {
        return {
          ...y,
          product: 'Variable Borrow',
          link: `${PRODUCTS.BORROW_VARIABLE}/${y.underlying.symbol}`,
        };
      }),
    leveragedVaults: allYields
      .filter((y) => y.token.tokenType === 'VaultShare')
      .map((y) => {
        return {
          ...y,
          product: 'Leveraged Vault',
          link: `${PRODUCTS.LEVERAGED_VAULT}/${y.underlying.symbol}`,
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
          link: `${PRODUCTS.LEND_LEVERAGED}/${y.underlying.symbol}`,
        };
      }),
    leveragedLiquidity: allYields
      .filter((y) => y.token.tokenType === 'nToken' && !!y.leveraged)
      .map((y) => {
        return {
          ...y,
          product: 'Leveraged Liquidity',
          link: `${PRODUCTS.LIQUIDITY_LEVERAGED}/${y.underlying.symbol}`,
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
  };
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

export const useSpotMaturityData = (
  tokens?: TokenDefinition[]
): MaturityData[] => {
  const { allYields } = useAllMarkets();
  const allYieldsNoLeverage = allYields.filter(
    (y) => y.leveraged === undefined
  );

  return (
    tokens?.map((t) => {
      const _t = Registry.getTokenRegistry().unwrapVaultToken(t);
      const spotRate =
        allYieldsNoLeverage.find((y) => y.token.id === _t.id)?.totalAPY || 0;

      return {
        token: t,
        tokenId: t.id,
        tradeRate: spotRate,
        maturity: t.maturity || 0,
        hasLiquidity: true,
        tradeRateString: formatInterestRate(spotRate),
      };
    }) || []
  );
};
