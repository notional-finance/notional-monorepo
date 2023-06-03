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
import { CalculationFnParams } from '@notional-finance/transaction';
import { filterEmpty, getNowSeconds, unique } from '@notional-finance/util';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  pairwise,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { isHashable } from '../utils';
import {
  BaseTradeState,
  InputAmount,
  TransactionConfig,
} from './base-trade-store';

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

export function initState(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    filter(([{ isReady }, selectedNetwork]) => !isReady && !!selectedNetwork),
    map(() => ({ isReady: true }))
  );
}

export function availableTokens(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  account$: ReturnType<typeof selectedAccount>,
  { collateralFilter, depositFilter, debtFilter }: TransactionConfig
) {
  return combineLatest([state$, selectedNetwork$, account$]).pipe(
    filter(([{ isReady }]) => isReady),
    map(([s, selectedNetwork, account]) => {
      const listedTokens =
        Registry.getTokenRegistry().getAllTokens(selectedNetwork);

      const availableCollateralTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeCash' ||
            t.tokenType === 'nToken' ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false &&
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) =>
          collateralFilter ? collateralFilter(t, account, s) : true
        );

      const availableDebtTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeDebt' ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === true &&
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) => (debtFilter ? debtFilter(t, account, s) : true));

      const availableDepositTokens = listedTokens
        .filter((t) => t.tokenType === 'Underlying')
        // By default we only allow tokens with a currency id specified (i.e. they are listed
        // on Notional)
        .filter((t) =>
          depositFilter ? depositFilter(t, account, s) : !!t.currencyId
        );

      const hasChanged =
        availableCollateralTokens.map((t) => t.id).join(':') !==
          s.availableCollateralTokens?.map((t) => t.id).join(':') ||
        availableDebtTokens.map((t) => t.id).join(':') !==
          s.availableDebtTokens?.map((t) => t.id).join(':') ||
        availableDepositTokens.map((t) => t.id).join(':') !==
          s.availableDepositTokens?.map((t) => t.id).join(':');

      return hasChanged
        ? {
            availableCollateralTokens,
            availableDebtTokens,
            availableDepositTokens,

            // Set the default values if only one is available
            selectedDepositToken:
              availableDepositTokens.length === 1
                ? availableDepositTokens[0].symbol
                : s.selectedDepositToken,
            selectedDebtToken:
              availableDebtTokens.length === 1
                ? availableDebtTokens[0].symbol
                : s.selectedDebtToken,
            selectedCollateralToken:
              availableCollateralTokens.length === 1
                ? availableCollateralTokens[0].symbol
                : s.selectedCollateralToken,
          }
        : undefined;
    }),
    filterEmpty()
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
    distinctUntilChanged(([p, prevNetwork], [c, selectedNetwork]) => {
      return (
        prevNetwork === selectedNetwork &&
        p.selectedRiskFactor === c.selectedRiskFactor &&
        p.selectedRiskLimit?.value === c.selectedRiskLimit?.value &&
        p.selectedRiskLimit?.symbol === c.selectedRiskLimit?.symbol &&
        p.selectedRiskArgs?.collateral === c.selectedRiskArgs?.collateral &&
        p.selectedRiskArgs?.debt === c.selectedRiskArgs?.debt
      );
    }),
    map(
      ([
        {
          selectedRiskFactor,
          selectedRiskLimit,
          selectedRiskArgs,
          riskFactorLimit: prevRiskFactorLimit,
        },
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

        return riskFactorLimit || prevRiskFactorLimit
          ? { riskFactorLimit }
          : undefined;
      }
    ),
    filterEmpty()
  );
}

export function calculate(
  state$: Observable<BaseTradeState>,
  debtPool$: ReturnType<typeof selectedPool>,
  collateralPool$: ReturnType<typeof selectedPool>,
  account$: Observable<AccountDefinition | null>,
  {
    calculationFn,
    requiredArgs,
    calculateCollateralOptions,
    calculateDebtOptions,
  }: TransactionConfig
) {
  return combineLatest([state$, debtPool$, collateralPool$, account$]).pipe(
    pairwise(),
    map(([[p], [s, debtPool, collateralPool, a]]) => ({
      prevCalculateInputKeys: p.calculateInputKeys,
      prevCanSubmit: p.canSubmit,
      s,
      debtPool,
      collateralPool,
      a,
    })),
    map(
      ({
        prevCanSubmit,
        prevCalculateInputKeys,
        s,
        debtPool,
        collateralPool,
        a,
      }) => {
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
                const risk = s[r] as
                  | RiskFactorLimit<RiskFactorKeys>
                  | undefined;
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

        const inputsSatisfied = requiredArgs.every(
          (r) => inputs[r] !== undefined
        );
        const calculateInputKeys = keys.join('|');
        return prevCanSubmit !== inputsSatisfied ||
          prevCalculateInputKeys !== calculateInputKeys
          ? {
              inputs,
              inputsSatisfied,
              calculateInputKeys,
              // If we can submit at this point, show the alternative options
              collateralTokens: calculateCollateralOptions
                ? s.availableCollateralTokens
                : undefined,
              debtTokens: calculateDebtOptions
                ? s.availableDebtTokens
                : undefined,
            }
          : undefined;
      }
    ),
    filterEmpty(),
    map((u) => {
      const { inputsSatisfied, inputs } = u;
      let calculateError: string | undefined;
      if (inputsSatisfied) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const outputs = calculationFn(inputs as any);

          return {
            ...u,
            ...outputs,
            calculateError,
            canSubmit: true,
          };
        } catch (e) {
          calculateError = (e as Error).toString();
        }
      }

      return { ...u, canSubmit: false, calculateError };
    }),
    map(({ inputs, collateralTokens, debtTokens, ...u }) => {
      let collateralOptions: (TokenBalance | null)[] | undefined;
      let debtOptions: (TokenBalance | null)[] | undefined;

      if (calculateCollateralOptions) {
        const satisfied = requiredArgs
          .filter((c) => c !== 'collateral')
          .every((r) => inputs[r] !== undefined);

        collateralOptions = satisfied
          ? collateralTokens?.map((c) => {
              const i = { ...inputs, collateral: c };
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { collateralBalance } = calculationFn(i as any) as {
                  collateralBalance: TokenBalance;
                };
                return collateralBalance;
              } catch (e) {
                console.error(e);
                return null;
              }
            })
          : undefined;
      }

      if (calculateDebtOptions) {
        const satisfied = requiredArgs
          .filter((c) => c !== 'debt')
          .every((r) => inputs[r] !== undefined);

        debtOptions = satisfied
          ? debtTokens?.map((d) => {
              const i = { ...inputs, debt: d };
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { debtBalance } = calculationFn(i as any) as {
                  debtBalance: TokenBalance;
                };
                return debtBalance;
              } catch {
                return null;
              }
            })
          : undefined;
      }

      return { ...u, collateralOptions, debtOptions };
    })
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
    distinctUntilChanged(
      ([, p], [, c]) =>
        p.canSubmit === c.canSubmit &&
        p.depositBalance?.hashKey === c.depositBalance?.hashKey &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey
    ),
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
