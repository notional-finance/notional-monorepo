import { Registry } from '@notional-finance/core-entities';
import {
  GlobalState,
  mapWithDistinctInputs,
  requireKeysDefined,
} from '@notional-finance/notionable';
import { filterEmpty } from '@notional-finance/util';
import { combineLatest, map, merge, Observable, pairwise, tap } from 'rxjs';
import { initialLiquidityState, LiquidityState } from './liquidity-context';

export const loadLiquidityManager = (
  state$: Observable<LiquidityState>,
  global$: Observable<GlobalState>
): Observable<Partial<LiquidityState>> => {
  const onNetworkChange$ = global$.pipe(
    filterEmpty(),
    pairwise(),
    map(([prev, cur]) => {
      if (prev.selectedNetwork !== cur.selectedNetwork) {
        return initialLiquidityState;
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );

  const selectedNetwork$ = global$.pipe(
    map((g) =>
      g.isNetworkReady && g.selectedNetwork ? g.selectedNetwork : undefined
    ),
    filterEmpty()
  );

  const onPageLoad$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([{ isReady }, selectedNetwork]) => {
      if (!isReady && selectedNetwork) {
        // Returns all the available tokens when the network is ready
        const allTokens =
          Registry.getTokenRegistry().getAllTokens(selectedNetwork);
        const availableNTokens = allTokens.filter(
          (t) => t.tokenType === 'nToken'
        );
        const availableDepositTokens = availableNTokens.map((n) => {
          const underlying = allTokens.find(
            (t) => t.currencyId === n.currencyId && t.tokenType === 'Underlying'
          );
          if (!underlying) throw Error('Cannot find underlying for nToken');
          return underlying;
        });

        return {
          isReady: true,
          availableDepositTokens,
          availableNTokens,
          availableTokens: availableDepositTokens.map((t) => t.symbol),
        };
      }

      return undefined;
    }),
    filterEmpty()
  );

  const onTokenSelect$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([s, selectedNetwork]) => ({ currency: s.currency, selectedNetwork })),
    requireKeysDefined('currency'),
    mapWithDistinctInputs(
      ({ currency, selectedNetwork }) => {
        const tokens = Registry.getTokenRegistry();

        const underlying = tokens.getTokenBySymbol(selectedNetwork, currency);
        if (!underlying.currencyId) return undefined;

        const nToken = tokens.getNToken(selectedNetwork, underlying.currencyId);

        // TODO: return other selected data here...
        return { nTokenSymbol: nToken.symbol, nToken, underlying };
      },
      'currency',
      'selectedNetwork'
    ),
    filterEmpty()
  );

  return merge(onNetworkChange$, onPageLoad$, onTokenSelect$);
};
