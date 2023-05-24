import { GlobalState } from '../global/global-state';
import { filterEmpty } from '@notional-finance/util';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  Observable,
} from 'rxjs';
import { initialLiquidityState, LiquidityState } from './liquidity-store';
import { mapWithDistinctInputs, requireKeysDefined } from '../utils';
import {
  resetOnNetworkChange,
  selectedAccount,
  selectedCashGroup,
  selectedNetwork,
} from '../global/helpers';
import {
  getAllNTokens,
  getMintNTokenTxn,
  getNTokenClaims,
  getNTokenData,
  getSelectedNToken,
} from './logic';

export const loadLiquidityManager = (
  state$: Observable<LiquidityState>,
  global$: Observable<GlobalState>
): Observable<Partial<LiquidityState>> => {
  const onNetworkChange$ = resetOnNetworkChange(global$, initialLiquidityState);
  const selectedNetwork$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const nTokenPool$ = selectedCashGroup(
    state$.pipe(
      map((s) => s.selectedNToken),
      distinctUntilChanged()
    )
  );

  const onPageLoad$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([{ isReady }, selectedNetwork]) =>
      !isReady && selectedNetwork ? getAllNTokens(selectedNetwork) : undefined
    ),
    filterEmpty()
  );

  const onTokenSelect$ = combineLatest([state$, selectedNetwork$]).pipe(
    map(([s, selectedNetwork]) => ({
      currency: s.currency,
      selectedNetwork,
    })),
    requireKeysDefined('currency', 'selectedNetwork'),
    mapWithDistinctInputs(getSelectedNToken, 'currency'),
    filterEmpty()
  );

  const onPoolDataChange$ = nTokenPool$.pipe(
    filterEmpty(),
    map((nTokenPool) => getNTokenData(nTokenPool))
  );

  const onInputChange$ = combineLatest([state$, nTokenPool$]).pipe(
    map(([s, nTokenPool]) => ({ ...s, nTokenPool })),
    requireKeysDefined('inputAmount', 'underlying', 'nTokenPool'),
    mapWithDistinctInputs(getNTokenClaims, 'inputAmount', 'underlying')
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
    onTxnBuild$,
    onPoolDataChange$
  );
};
