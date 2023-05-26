import {
  AccountDefinition,
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { filterEmpty } from '@notional-finance/util';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
  switchMap,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { BaseTradeState, CashGroupData } from './base-trade-store';

type Category = 'Collateral' | 'Debt' | 'Deposit';

export function resetOnNetworkChange<T>(
  global$: Observable<GlobalState>,
  initialState: T
) {
  return global$.pipe(
    filterEmpty(),
    pairwise(),
    map(([prev, cur]) => {
      if (prev.selectedNetwork !== cur.selectedNetwork) {
        return initialState;
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

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
        prev.selectedNetwork !== cur.selectedNetwork ||
        prev.selectedAccount !== cur.selectedAccount
    ),
    switchMap(({ selectedNetwork, selectedAccount }) =>
      Registry.getAccountRegistry().subscribeAccount(
        selectedNetwork,
        selectedAccount
      )
    )
  );
}

export function initState(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  collateralTokenFilter: (t: TokenDefinition) => boolean = () => true,
  debtTokenFilter: (t: TokenDefinition) => boolean = () => true
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    // TODO: can add a switchMap here that emits whenever the token registry updates on
    // last timestamp so that we can get long running token updates...
    filter(([{ isReady }, selectedNetwork]) => !isReady && !!selectedNetwork),
    map(([_, selectedNetwork]) => {
      const listedTokens = Registry.getTokenRegistry()
        .getAllTokens(selectedNetwork)
        // Filter to those with currency ids
        .filter((t) => !!t.currencyId);

      const availableCollateralTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeCash' ||
            t.tokenType === 'nToken' ||
            t.tokenType === 'fCash'
        )
        .filter(collateralTokenFilter);

      const availableDebtTokens = listedTokens
        .filter((t) => t.tokenType === 'PrimeDebt' || t.tokenType === 'fCash')
        .filter(debtTokenFilter);

      return { availableCollateralTokens, availableDebtTokens };
    })
  );
}

export function selectedTokens(
  category: Category,
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    map(([s, selectedNetwork]) => ({
      selectedToken:
        category === 'Collateral'
          ? s.selectedCollateralToken
          : s.selectedDebtToken,
      selectedNetwork,
    })),
    distinctUntilChanged(
      (p, c) =>
        p.selectedToken !== c.selectedToken ||
        p.selectedNetwork !== c.selectedNetwork
    ),
    map(({ selectedToken, selectedNetwork }) => {
      let token: TokenDefinition | undefined;
      let underlying: TokenDefinition | undefined;
      let nToken: TokenDefinition | undefined;

      if (selectedToken && selectedNetwork) {
        const tokens = Registry.getTokenRegistry();
        token = tokens.getTokenBySymbol(selectedNetwork, selectedToken);
        underlying = tokens.getUnderlying(selectedNetwork, token.currencyId);
        try {
          nToken = tokens.getNToken(selectedNetwork, token.currencyId);
        } catch {
          // NOTE: some tokens may not have nTokens listed, if so then this will
          // remain undefined
        }
      }

      return category === 'Collateral'
        ? {
            collateralToken: token,
            underlyingCollateralToken: underlying,
            collateralNToken: nToken,
          }
        : {
            debtToken: token,
            underlyingDebtToken: underlying,
            debtNToken: nToken,
          };
    })
  );
}

export function selectedPool(
  category: Category,
  state$: Observable<BaseTradeState>
) {
  return state$.pipe(
    map((s) => (category === 'Collateral' ? s.collateralNToken : s.debtNToken)),
    filterEmpty(),
    switchMap((n) => {
      return n
        ? Registry.getExchangeRegistry().subscribePoolInstance<fCashMarket>(
            n.network,
            n.address
          ) || of(undefined)
        : of(undefined);
    })
  );
}

export function emitPoolData(
  category: Category,
  pool$: ReturnType<typeof selectedPool>
) {
  return pool$.pipe(
    filterEmpty(),
    map((_p): CashGroupData => {
      // TODO: fill this out
      return {} as CashGroupData;
    }),
    map((d) =>
      category === 'Collateral' ? { collateralData: d } : { debtData: d }
    )
  );
}

export function emitAccountRisk(
  account$: Observable<AccountDefinition | null>
) {
  return account$.pipe(
    filterEmpty(),
    map(({ balances }) => AccountRiskProfile.from(balances).getAllRiskFactors())
  );
}

export function parseBalance(
  category: Category,
  state$: Observable<BaseTradeState>
) {
  return state$.pipe(
    map((s) => {
      switch (category) {
        case 'Deposit':
          return {
            inputAmount: s.depositInputAmount,
            token: s.underlyingCollateralToken,
            underlying: s.underlyingCollateralToken,
          };
        case 'Collateral':
          return {
            inputAmount: s.collateralInputAmount,
            token: s.collateralToken,
            underlying: s.underlyingCollateralToken,
          };
        case 'Debt':
          return {
            inputAmount: s.debtInputAmount,
            token: s.debtToken,
            underlying: s.underlyingDebtToken,
          };
      }
    }),
    distinctUntilChanged(
      (p, c) =>
        p?.underlying?.id !== c?.underlying?.id ||
        p?.token?.id !== c?.token?.id ||
        p?.inputAmount?.inUnderlying !== c?.inputAmount?.inUnderlying ||
        p?.inputAmount?.amount !== p?.inputAmount?.amount
    ),
    map(({ inputAmount, token, underlying }) => {
      if (inputAmount?.inUnderlying === false && category === 'Deposit')
        throw Error('Deposits must be in underlying');
      if (inputAmount?.inUnderlying && underlying)
        return TokenBalance.fromFloat(inputAmount.amount, underlying);
      else if (inputAmount?.inUnderlying == false && token)
        return TokenBalance.fromFloat(inputAmount.amount, token);
      else return undefined;
    }),
    map((b) => {
      switch (category) {
        case 'Deposit':
          // NOTE: this is always in underlying
          return { depositBalance: b };
        case 'Collateral':
          // NOTE: this may be in underlying or collateral token
          return { collateralBalance: b };
        case 'Debt':
          // NOTE: this may be in underlying or debt token
          return { debtBalance: b };
      }
    })
  );
}
