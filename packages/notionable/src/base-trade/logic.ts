import {
  AccountDefinition,
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  RiskFactorKeys,
  RiskFactorLimit,
} from '@notional-finance/risk-engine';
import {
  CalculationFn,
  CalculationFnParams,
} from '@notional-finance/transaction';
import { filterEmpty } from '@notional-finance/util';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
  tap,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { isHashable } from '../utils';
import { TransactionConfig } from './base-trade-manager';
import { BaseTradeState, InputAmount } from './base-trade-store';

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
        prev.selectedNetwork === cur.selectedNetwork ||
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

export function initState(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  tokenFilters?: {
    depositFilter?: (t: TokenDefinition) => boolean;
    collateralFilter?: (t: TokenDefinition) => boolean;
    debtFilter?: (t: TokenDefinition) => boolean;
  }
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    // TODO: can add a switchMap here that emits whenever the token registry updates on
    // last timestamp so that we can get long running token updates...
    filter(([{ isReady }, selectedNetwork]) => !isReady && !!selectedNetwork),
    map(([_, selectedNetwork]) => {
      const listedTokens =
        Registry.getTokenRegistry().getAllTokens(selectedNetwork);

      const availableCollateralTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeCash' ||
            t.tokenType === 'nToken' ||
            t.tokenType === 'fCash'
        )
        .filter(tokenFilters?.collateralFilter || (() => true));

      const availableDebtTokens = listedTokens
        .filter((t) => t.tokenType === 'PrimeDebt' || t.tokenType === 'fCash')
        .filter(tokenFilters?.debtFilter || (() => true));

      const availableDepositTokens = listedTokens
        .filter((t) => t.tokenType === 'Underlying')
        .filter(
          // Using this default filter allows the sNOTE UI to work
          tokenFilters?.depositFilter || ((t) => t.currencyId !== undefined)
        );

      return {
        isReady: true,
        availableCollateralTokens,
        availableDebtTokens,
        availableDepositTokens,
      };
    })
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
      return {
        hasChanged:
          (prevS[`selected${category}Token`] as string) !== selectedToken ||
          prevN !== selectedNetwork,
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

export function selectedPool(
  category: Category,
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return state$.pipe(
    map((s) => s[category.toLowerCase()] as TokenDefinition | undefined),
    distinctUntilChanged((p, c) => p?.id === c?.id),
    filterEmpty(),
    withLatestFrom(selectedNetwork$),
    switchMap(([t, network]) => {
      try {
        const nToken = Registry.getTokenRegistry().getNToken(
          network,
          t.currencyId
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

export function parseBalance(
  category: Category,
  state$: Observable<BaseTradeState>
) {
  return state$.pipe(
    // NOTE: distinct until changed does not work with this for some reason
    pairwise(),
    map(([p, s]) => {
      const prevToken = p[category.toLowerCase()] as
        | TokenDefinition
        | undefined;
      const prevInputAmount = p[
        `${category.toLowerCase()}InputAmount`
      ] as InputAmount;
      const token = s[category.toLowerCase()] as TokenDefinition | undefined;
      const inputAmount = s[
        `${category.toLowerCase()}InputAmount`
      ] as InputAmount;
      return {
        hasChanged:
          prevToken?.id !== token?.id ||
          prevInputAmount?.inUnderlying !== inputAmount?.inUnderlying ||
          prevInputAmount?.amount !== inputAmount?.amount,
        token,
        inputAmount,
      };
    }),
    filter(({ hasChanged }) => hasChanged),
    map(({ inputAmount, token }) => {
      const key = `${category.toLowerCase()}Balance`;

      if (inputAmount === undefined || token === undefined) {
        return { [key]: undefined };
      }

      if (inputAmount?.inUnderlying === false && category === 'Deposit')
        throw Error('Deposits must be in underlying');

      try {
        if (inputAmount.inUnderlying) {
          const underlying = Registry.getTokenRegistry().getUnderlying(
            token.network,
            token.currencyId
          );
          return {
            [key]: TokenBalance.fromFloat(inputAmount.amount, underlying),
          };
        } else {
          return { [key]: TokenBalance.fromFloat(inputAmount.amount, token) };
        }
      } catch (e) {
        console.error(e);
        return { [key]: undefined };
      }
    })
  ) as Observable<{
    depositBalance: TokenBalance | undefined;
    collateralBalance: TokenBalance | undefined;
    debtBalance: TokenBalance | undefined;
  }>;
}

export function parseRiskFactorLimit(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    distinctUntilChanged(
      ([p, prevNetwork], [c, selectedNetwork]) =>
        prevNetwork === selectedNetwork ||
        p.selectedRiskFactor === c.selectedRiskFactor ||
        p.selectedRiskLimit?.value === c.selectedRiskLimit?.value ||
        p.selectedRiskLimit?.symbol === c.selectedRiskLimit?.symbol ||
        p.selectedRiskArgs?.collateral === c.selectedRiskArgs?.collateral ||
        p.selectedRiskArgs?.debt === c.selectedRiskArgs?.debt
    ),
    map(
      ([
        { selectedRiskFactor, selectedRiskLimit, selectedRiskArgs },
        network,
      ]) => {
        let riskFactorLimit: RiskFactorLimit<RiskFactorKeys> | undefined;
        const tokens = Registry.getTokenRegistry();
        if (
          selectedRiskFactor === 'liquidationPrice' &&
          selectedRiskLimit &&
          selectedRiskLimit.symbol !== undefined &&
          selectedRiskArgs?.debt !== undefined
        ) {
          riskFactorLimit = {
            riskFactor: selectedRiskFactor,
            limit: TokenBalance.fromFloat(
              selectedRiskLimit.value,
              tokens.getTokenBySymbol(network, selectedRiskLimit.symbol)
            ),
            args: [
              tokens.getTokenBySymbol(network, selectedRiskArgs.collateral),
              tokens.getTokenBySymbol(network, selectedRiskArgs.debt),
            ],
          };
        } else if (
          selectedRiskFactor === 'collateralLiquidationThreshold' &&
          selectedRiskLimit &&
          selectedRiskArgs
        ) {
          riskFactorLimit = {
            riskFactor: selectedRiskFactor,
            limit: TokenBalance.fromFloat(
              selectedRiskLimit.value,
              tokens.getTokenBySymbol(network, selectedRiskArgs.collateral)
            ),
            args: [
              tokens.getTokenBySymbol(network, selectedRiskArgs.collateral),
            ],
          };
        } else if (
          (selectedRiskFactor === 'freeCollateral' ||
            selectedRiskFactor === 'netWorth') &&
          selectedRiskLimit
        ) {
          riskFactorLimit = {
            riskFactor: selectedRiskFactor,
            limit: TokenBalance.fromFloat(
              selectedRiskLimit.value,
              tokens.getTokenBySymbol(network, 'ETH')
            ),
          };
        } else if (selectedRiskFactor && selectedRiskLimit) {
          riskFactorLimit = {
            riskFactor: selectedRiskFactor,
            limit: selectedRiskLimit.value,
          };
        }

        return riskFactorLimit ? { riskFactorLimit } : undefined;
      }
    ),
    filterEmpty()
  );
}

export function calculate<F extends CalculationFn>(
  state$: Observable<BaseTradeState>,
  debtPool$: ReturnType<typeof selectedPool>,
  collateralPool$: ReturnType<typeof selectedPool>,
  account$: Observable<AccountDefinition | null>,
  { calculationFn, requiredArgs }: TransactionConfig<F>
) {
  return combineLatest([state$, debtPool$, collateralPool$, account$]).pipe(
    pairwise(),
    map(([[p], [s, debtPool, collateralPool, a]]) => ({
      prevCanSubmit: p.canSubmit,
      s,
      debtPool,
      collateralPool,
      a,
    })),
    map(({ prevCanSubmit, s, debtPool, collateralPool, a }) => {
      const [inputs, keys] = requiredArgs.reduce(
        ([inputs, keys], r) => {
          switch (r) {
            case 'collateralPool':
              return [
                Object.assign(inputs, { collateralPool }),
                [...keys, collateralPool?.hashKey || ''],
              ];
            case 'debtPool':
              return [
                Object.assign(inputs, { debtPool }),
                [...keys, debtPool?.hashKey || ''],
              ];
            case 'balances':
              return [
                Object.assign(inputs, { balances: a?.balances }),
                [...keys, ...(a?.balances.map((b) => b.hashKey) || [])],
              ];
            case 'collateral':
            case 'debt':
            case 'depositUnderlying':
              return [
                Object.assign(inputs, { [r]: s[r] }),
                [...keys, (s[r] as TokenDefinition | undefined)?.id || ''],
              ];
            case 'depositBalance':
            case 'debtBalance':
            case 'collateralBalance':
              return [
                Object.assign(inputs, { [r]: s[r] }),
                [...keys, (s[r] as TokenBalance | undefined)?.hashKey || ''],
              ];
            case 'riskFactorLimit': {
              const risk = s[r] as RiskFactorLimit<RiskFactorKeys> | undefined;
              return [
                Object.assign(inputs, { [r]: risk }),
                [
                  ...keys,
                  `${risk?.riskFactor}:${
                    isHashable(risk?.limit)
                      ? risk?.limit.hashKey
                      : risk?.limit.toString()
                  }:${risk?.args?.map((t) => t.id).join(':')}`,
                ],
              ];
            }
            case 'maxCollateralSlippage':
            case 'maxDebtSlippage':
              return [
                Object.assign(inputs, { [r]: s[r] }),
                [...keys, (s[r] as number | undefined)?.toString() || ''],
              ];
            default:
              return [inputs, keys];
          }
        },
        [{} as Record<CalculationFnParams, unknown>, [] as string[]]
      );

      console.log('DUMP STATE', s.depositInputAmount, s.depositBalance);
      return {
        prevCanSubmit,
        inputs,
        keys: keys.join('|'),
        // Check that all required inputs are satisfied
        canSubmit: requiredArgs.every((r) => inputs[r] !== undefined),
      };
    }),
    filter(
      ({ prevCanSubmit, canSubmit }) =>
        // Don't emit if we still cannot submit
        prevCanSubmit !== canSubmit
    ),
    map(({ inputs, canSubmit }) => {
      let calculateError: string | undefined;
      if (canSubmit) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const outputs = calculationFn(inputs as any);

          return {
            canSubmit,
            calculateError,
            ...outputs,
          };
        } catch (e) {
          calculateError = (e as Error).toString();
        }
      }

      return { canSubmit: false, calculateError };
    }),
    tap((e) => console.log('calculate emit', e))
  );
}

export function priorAccountRisk(
  account$: Observable<AccountDefinition | null>
) {
  return account$.pipe(
    filterEmpty(),
    map(({ balances }) => ({
      priorAccountRisk: AccountRiskProfile.from(balances).getAllRiskFactors(),
    }))
  );
}

export function postAccountRisk(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([account$, state$]).pipe(
    map(
      ([
        account,
        { canSubmit, depositBalance, collateralBalance, debtBalance },
      ]) => {
        if (canSubmit && account) {
          const profile = AccountRiskProfile.simulate(
            account.balances,
            [depositBalance, collateralBalance, debtBalance].filter(
              (b) => b !== undefined
            ) as TokenBalance[]
          );

          return { postAccountRisk: profile.getAllRiskFactors() };
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}
