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
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
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
    distinctUntilChanged((p, c) => p?.id !== c?.id),
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
    })
  );
}

export function parseBalance(
  category: Category,
  state$: Observable<BaseTradeState>
) {
  return state$.pipe(
    map((s) => ({
      token: s[category.toLowerCase()] as TokenDefinition | undefined,
      inputAmount: s[`${category.toLowerCase()}InputAmount`] as InputAmount,
    })),
    distinctUntilChanged(
      (p, c) =>
        p?.token?.id !== c?.token?.id ||
        p?.inputAmount?.inUnderlying !== c?.inputAmount?.inUnderlying ||
        p?.inputAmount?.amount !== p?.inputAmount?.amount
    ),
    map(({ inputAmount, token }) => {
      if (inputAmount === undefined || token === undefined) return undefined;
      if (inputAmount?.inUnderlying === false && category === 'Deposit')
        throw Error('Deposits must be in underlying');

      try {
        if (inputAmount.inUnderlying) {
          const underlying = Registry.getTokenRegistry().getUnderlying(
            token.network,
            token.currencyId
          );
          return TokenBalance.fromFloat(inputAmount.amount, underlying);
        } else {
          return TokenBalance.fromFloat(inputAmount.amount, token);
        }
      } catch (e) {
        console.error(e);
        return undefined;
      }
    }),
    map((b) => {
      return { [`${category.toLowerCase()}Balance`]: b } as {
        depositBalance: TokenBalance | undefined;
        debtBalance: TokenBalance | undefined;
        collateralBalance: TokenBalance | undefined;
      };
    })
  );
}

export function parseRiskFactorLimit(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
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

        return { riskFactorLimit };
      }
    )
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
    map(([s, debtPool, collateralPool, a]) => {
      // Map all the state into the required inputs
      const inputs = requiredArgs.reduce((args, r) => {
        switch (r) {
          case 'collateralPool':
            return Object.assign(args, { collateralPool });
          case 'debtPool':
            return Object.assign(args, { debtPool });
          case 'balances':
            return Object.assign(args, { balances: a?.balances });
          case 'riskFactorLimit':
          case 'collateral':
          case 'depositBalance':
          case 'debtBalance':
          case 'debt':
          case 'collateralBalance':
          case 'depositUnderlying':
          case 'maxCollateralSlippage':
          case 'maxDebtSlippage':
            return Object.assign(args, { r: s[r] });
          default:
            return args;
        }
      }, {} as Record<CalculationFnParams, unknown>);

      return {
        inputs,
        // Check that all required inputs are satisfied
        canSubmit: requiredArgs.every((r) => inputs[r] !== undefined),
      };
    }),
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
          console.error(e);
          calculateError = (e as Error).toString();
        }
      }

      return { canSubmit: false, calculateError };
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
