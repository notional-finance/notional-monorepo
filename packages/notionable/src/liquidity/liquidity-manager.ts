import { GlobalState } from '../global/global-state';
import { filterEmpty } from '@notional-finance/util';
import { combineLatest, map, merge, Observable } from 'rxjs';
import { initialLiquidityState, LiquidityState } from './liquidity-store';
import { mapWithDistinctInputs, requireKeysDefined } from '../utils';
import {
  resetOnNetworkChange,
  selectedAccount,
  selectedNetwork,
} from '../global/helpers';
import { getAllNTokens, getMintNTokenTxn, getNTokenClaims, getSelectedNToken } from './logic';

export const loadLiquidityManager = (
  state$: Observable<LiquidityState>,
  global$: Observable<GlobalState>
): Observable<Partial<LiquidityState>> => {
  const onNetworkChange$ = resetOnNetworkChange(global$, initialLiquidityState);
  const selectedNetwork$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);

  const onPageLoad$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([{ isReady }, selectedNetwork]) =>
      !isReady && selectedNetwork ? getAllNTokens(selectedNetwork) : undefined
    ),
    filterEmpty()
  );

  const onTokenSelect$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([s, selectedNetwork]) => ({ currency: s.currency, selectedNetwork })),
    requireKeysDefined('currency'),
    mapWithDistinctInputs(getSelectedNToken, 'currency', 'selectedNetwork'),
    filterEmpty()
  );

  const onInputChange$ = state$.pipe(
    requireKeysDefined('inputAmount', 'nToken', 'underlying'),
    mapWithDistinctInputs(
      getNTokenClaims,
      'inputAmount',
      'nToken',
      'underlying'
    )
  );

  const onTxnBuild$ = combineLatest([state$, account$]).pipe(
    map(([s, account]) => ({ ...s, account })),
    requireKeysDefined('account', 'inputAmount', 'underlying'),
    mapWithDistinctInputs(
      getMintNTokenTxn,
      'account',
      'inputAmount',
      'underlying'
    )
  );

  return merge(
    onNetworkChange$,
    onPageLoad$,
    onTokenSelect$,
    onInputChange$,
    onTxnBuild$
  );
};
