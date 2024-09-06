import {
  VaultAdapter,
  Registry,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { filterEmpty, unique } from '@notional-finance/util';
import {
  Observable,
  map,
  distinctUntilChanged,
  withLatestFrom,
  switchMap,
  of,
  startWith,
} from 'rxjs';
import { VaultTradeState, BaseTradeState } from '../base-trade-store';
import { selectedNetwork } from '../../global';
import { Category } from './tokens';

export function selectedVaultAdapter(
  state$: Observable<VaultTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
): Observable<VaultAdapter | undefined> {
  return state$.pipe(
    map((s) => (s.isReady ? s.vaultAddress : undefined)),
    filterEmpty(),
    distinctUntilChanged(),
    withLatestFrom(selectedNetwork$),
    switchMap(() => {
      // Currently undefined
      return of(undefined);
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
      const pool = Registry.getExchangeRegistry().subscribeNotionalMarket(
        network,
        currencyId
      );
      if (!pool) return of(undefined);
      return pool;
    }),
    startWith(undefined)
  );
}
