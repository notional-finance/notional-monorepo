import {
  Registry,
  TokenDefinition,
  fCashMarket,
} from '@notional-finance/core-entities';
import { filterEmpty, unique } from '@notional-finance/util';
import {
  Observable,
  map,
  combineLatest,
  distinctUntilChanged,
  switchMap,
  startWith,
  pairwise,
  filter,
  withLatestFrom,
  of,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { BaseTradeState, VaultTradeState } from './base-trade-store';

export type Category = 'Collateral' | 'Debt' | 'Deposit';

export function selectedNetwork(global$: Observable<GlobalState>) {
  return global$.pipe(
    map((g) =>
      g.isNetworkReady && g.selectedNetwork ? g.selectedNetwork : undefined
    ),
    filterEmpty()
  );
}

export function selectedAccount(global$: Observable<GlobalState>) {
  return combineLatest([global$, selectedNetwork(global$)]).pipe(
    map(([g, selectedNetwork]) =>
      g.isAccountReady && g.selectedAccount
        ? { selectedNetwork, selectedAccount: g.selectedAccount }
        : undefined
    ),
    filterEmpty(),
    distinctUntilChanged(
      (prev, cur) =>
        prev.selectedNetwork === cur.selectedNetwork &&
        prev.selectedAccount === cur.selectedAccount
    ),
    switchMap(({ selectedNetwork, selectedAccount }) =>
      Registry.getAccountRegistry().subscribeAccount(
        selectedNetwork,
        selectedAccount
      )
    ),
    startWith(null)
  );
}

export function selectedToken(
  category: Category,
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    // NOTE: distinct until changed does not work with this for some reason
    pairwise(),
    map(([[prevS, prevN], [curS, selectedNetwork]]) => {
      const selectedToken = curS[`selected${category}Token`] as string;
      const token = curS[category.toLowerCase()] as TokenDefinition | undefined;
      return {
        hasChanged:
          (prevS[`selected${category}Token`] as string) !== selectedToken ||
          prevN !== selectedNetwork ||
          (!!selectedToken && token === undefined),
        selectedToken,
        selectedNetwork,
      };
    }),
    filter(({ hasChanged }) => hasChanged),
    map(({ selectedToken, selectedNetwork }) => {
      let token: TokenDefinition | undefined;
      if (selectedToken && selectedNetwork) {
        try {
          const tokens = Registry.getTokenRegistry();
          token = tokens.getTokenBySymbol(selectedNetwork, selectedToken);
        } catch {
          // NOTE: some tokens may not have nTokens listed, if so then this will
          // remain undefined
          console.error(
            `Token ${selectedToken} not found on network ${selectedNetwork}`
          );
        }
      }

      return {
        [category.toLowerCase()]: token,
      } as {
        collateral: TokenDefinition | undefined;
        debt: TokenDefinition | undefined;
        deposit: TokenDefinition | undefined;
      };
    })
  );
}

export function selectedVaultAdapter(
  state$: Observable<VaultTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return state$.pipe(
    map((s) => s.vaultAddress),
    distinctUntilChanged(),
    filterEmpty(),
    withLatestFrom(selectedNetwork$),
    switchMap(([vaultAddress, network]) => {
      try {
        return (
          Registry.getVaultRegistry().subscribeVaultAdapter(
            network,
            vaultAddress
          ) || of(undefined)
        );
      } catch {
        return of(undefined);
      }
    }),
    startWith(undefined)
  );
}

export function selectedPool(
  category: Category,
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return state$.pipe(
    map((s) => {
      const selectedToken = s[category.toLowerCase()] as
        | TokenDefinition
        | undefined;
      const availableTokens = unique(
        (s[`available${category}Tokens`] as TokenDefinition[] | undefined)?.map(
          (t) => t.currencyId
        ) || []
      );
      if (selectedToken) return selectedToken.currencyId;
      // If all the available tokens are in the same currency id, then the pool can also
      // be selected
      if (availableTokens.length === 1) return availableTokens[0];
      return undefined;
    }),
    distinctUntilChanged(),
    filterEmpty(),
    withLatestFrom(selectedNetwork$),
    switchMap(([currencyId, network]) => {
      try {
        const nToken = Registry.getTokenRegistry().getNToken(
          network,
          currencyId
        );

        return (
          Registry.getExchangeRegistry().subscribePoolInstance<fCashMarket>(
            network,
            nToken.address
          ) || of(undefined)
        );
      } catch {
        // Some currencies do not have nTokens
        return of(undefined);
      }
    }),
    startWith(undefined)
  );
}
