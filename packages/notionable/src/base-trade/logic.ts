import {
  AccountDefinition,
  BaseLiquidityPool,
  Registry,
  TokenBalance,
  TokenDefinition,
  VaultAdapter,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  RiskFactorKeys,
  RiskFactorLimit,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { CalculationFnParams } from '@notional-finance/transaction';
import { filterEmpty, getNowSeconds } from '@notional-finance/util';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  pairwise,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { isHashable } from '../utils';
import {
  BaseTradeState,
  InputAmount,
  TradeConfiguration,
  TradeType,
  VaultTradeConfiguration,
  VaultTradeState,
  VaultTradeType,
  isVaultTrade,
} from './base-trade-store';
import { selectedNetwork, selectedAccount, Category } from './selectors';

function getTradeConfig(tradeType?: TradeType | VaultTradeType) {
  if (!tradeType) throw Error('Trade type undefined');

  const config =
    TradeConfiguration[tradeType as TradeType] ||
    VaultTradeConfiguration[tradeType as VaultTradeType];

  if (!config) throw Error('Trade configuration not found');
  return config;
}

/** Ensures that tokens are automatically selected or cleared when they change */
function getSelectedToken(
  availableTokens: TokenDefinition[],
  selectedToken: string | undefined
) {
  if (availableTokens.length === 1) return availableTokens[0].symbol;
  if (!availableTokens.find((t) => t.symbol === selectedToken))
    return undefined;
  else return selectedToken;
}

export function resetOnNetworkChange(
  global$: Observable<GlobalState>,
  state$: Observable<BaseTradeState>
) {
  return global$.pipe(
    filterEmpty(),
    pairwise(),
    withLatestFrom(state$),
    map(([[prev, cur], s]) => {
      if (prev.selectedNetwork !== cur.selectedNetwork) {
        return { reset: true, tradeType: s.tradeType };
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

export function resetOnTradeTypeChange(
  state$: Observable<BaseTradeState>,
  isVault = false
) {
  return state$.pipe(
    filterEmpty(),
    pairwise(),
    map(([prev, cur]) => {
      if (prev.tradeType !== undefined && prev.tradeType !== cur.tradeType) {
        return {
          reset: true,
          tradeType: cur.tradeType,
          vaultAddress: cur.vaultAddress,
        };
      } else if (
        isVault &&
        prev.vaultAddress !== undefined &&
        prev.vaultAddress !== cur.vaultAddress
      ) {
        return {
          reset: true,
          vaultAddress: cur.vaultAddress,
          tradeType: cur.tradeType,
        };
      } else {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

export function initVaultState(
  state$: Observable<VaultTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    filter(
      ([{ isReady, vaultAddress }, selectedNetwork]) =>
        !isReady && !!selectedNetwork && !!vaultAddress
    ),
    switchMap(([{ vaultAddress }, selectedNetwork]) => {
      return new Promise((resolve) => {
        if (!vaultAddress) resolve(undefined);
        else {
          Registry.getVaultRegistry().onNetworkRegistered(
            selectedNetwork,
            () => {
              return Registry.getConfigurationRegistry().onNetworkRegistered(
                selectedNetwork,
                () => {
                  const vaultConfig =
                    Registry.getConfigurationRegistry().getVaultConfig(
                      selectedNetwork,
                      vaultAddress
                    );
                  resolve({ isReady: true, vaultConfig });
                }
              );
            }
          );
        }
      });
    }),
    filterEmpty()
  );
}

export function initState(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, selectedNetwork$]).pipe(
    filter(
      ([{ isReady, tradeType }, selectedNetwork]) =>
        !isReady && !!selectedNetwork && !!tradeType
    ),
    map(() => ({ isReady: true }))
  );
}

export function availableTokens(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, selectedNetwork$, account$]).pipe(
    filter(([{ isReady, tradeType }]) => isReady && !!tradeType),
    switchMap(([s, selectedNetwork, account]) => {
      return new Promise((resolve) => {
        const { collateralFilter, depositFilter, debtFilter } = getTradeConfig(
          s.tradeType
        );
        Registry.getTokenRegistry().onNetworkRegistered(selectedNetwork, () => {
          const listedTokens =
            Registry.getTokenRegistry().getAllTokens(selectedNetwork);

          const availableCollateralTokens = listedTokens
            .filter(
              (t) =>
                t.tokenType === 'PrimeCash' ||
                t.tokenType === 'nToken' ||
                (t.tokenType === 'VaultShare' &&
                  (t.maturity || 0) > getNowSeconds()) ||
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
                (t.tokenType === 'VaultDebt' &&
                  (t.maturity || 0) > getNowSeconds()) ||
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

          const selectedDepositToken = getSelectedToken(
            availableDepositTokens,
            s.selectedDepositToken
          );
          const selectedDebtToken = getSelectedToken(
            availableDebtTokens,
            s.selectedDebtToken
          );
          const selectedCollateralToken = getSelectedToken(
            availableCollateralTokens,
            s.selectedCollateralToken
          );

          resolve(
            hasChanged
              ? {
                  availableCollateralTokens,
                  availableDebtTokens,
                  availableDepositTokens,

                  // Set the default values if only one is available
                  selectedDepositToken,
                  selectedDebtToken,
                  selectedCollateralToken,
                }
              : undefined
          );
        });
      });
    }),
    filterEmpty()
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
  debtPool$: Observable<BaseLiquidityPool<unknown> | undefined>,
  collateralPool$: Observable<BaseLiquidityPool<unknown> | undefined>,
  vaultAdapter$: Observable<VaultAdapter | undefined>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([
    state$,
    debtPool$,
    collateralPool$,
    account$,
    vaultAdapter$,
  ]).pipe(
    filter(([s]) => s.isReady && !!s.tradeType),
    pairwise(),
    map(([[p], [s, debtPool, collateralPool, a, vaultAdapter]]) => ({
      prevCalculateInputKeys: p.calculateInputKeys,
      prevInputsSatisfied: p.inputsSatisfied,
      s,
      debtPool,
      collateralPool,
      a,
      vaultAdapter,
    })),
    map(
      ({
        prevInputsSatisfied,
        prevCalculateInputKeys,
        s,
        debtPool,
        collateralPool,
        a,
        vaultAdapter,
      }) => {
        const {
          requiredArgs,
          calculateCollateralOptions,
          calculateDebtOptions,
        } = getTradeConfig(s.tradeType);

        const [inputs, keys] = requiredArgs.reduce(
          ([inputs, keys], r) => {
            switch (r) {
              case 'collateralPool':
                return [
                  Object.assign(inputs, { collateralPool }),
                  [...keys, collateralPool?.hashKey || ''],
                ];
              case 'vaultAdapter':
                return [
                  Object.assign(inputs, { vaultAdapter }),
                  [...keys, vaultAdapter?.hashKey || ''],
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
        return prevInputsSatisfied !== inputsSatisfied ||
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
              tradeType: s.tradeType,
            }
          : undefined;
      }
    ),
    filterEmpty(),
    map((u) => {
      const { inputsSatisfied, inputs, tradeType } = u;
      let calculateError: string | undefined;
      if (inputsSatisfied) {
        try {
          const { calculationFn } = getTradeConfig(tradeType);
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
    map(({ inputs, collateralTokens, debtTokens, tradeType, ...u }) => {
      const {
        calculationFn,
        requiredArgs,
        calculateCollateralOptions,
        calculateDebtOptions,
      } = getTradeConfig(tradeType);

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
          .filter((c) => (isVaultTrade(tradeType) ? c !== 'collateral' : true))
          .every((r) => inputs[r] !== undefined);

        debtOptions = satisfied
          ? debtTokens?.map((d) => {
              const i = { ...inputs, debt: d };
              try {
                if (isVaultTrade(tradeType)) {
                  // Switch to the matching vault share token for vault trades
                  if (!d.vaultAddress || !d.maturity)
                    throw Error('Invalid debt token');
                  i['collateral'] = Registry.getTokenRegistry().getVaultShare(
                    d.network,
                    d.vaultAddress,
                    d.maturity
                  );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { debtBalance } = calculationFn(i as any) as {
                  debtBalance: TokenBalance;
                };
                return debtBalance;
              } catch (e) {
                console.error(e);
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

export function priorVaultAccountRisk(
  state$: Observable<VaultTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    map(([{ vaultAddress }, account]) => {
      if (!vaultAddress || !account) return undefined;
      const vaultBalances =
        account.balances.filter((t) => t.token.vaultAddress === vaultAddress) ||
        [];
      if (vaultBalances.length === 0) return undefined;

      return {
        priorAccountRisk: VaultAccountRiskProfile.from(
          vaultAddress,
          vaultBalances
        ).getAllRiskFactors(),
      };
    }),
    filterEmpty()
  );
}

export function postVaultAccountRisk(
  state$: Observable<VaultTradeState>,
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
        {
          canSubmit,
          depositBalance,
          collateralBalance,
          collateral,
          debtBalance,
          vaultAddress,
        },
      ]) => {
        if (canSubmit && account && vaultAddress && collateral) {
          const profile = VaultAccountRiskProfile.simulate(
            vaultAddress,
            account.balances,
            [
              // Deposits are converted to vault shares
              depositBalance?.toToken(collateral),
              collateralBalance,
              debtBalance,
            ].filter((b) => b !== undefined) as TokenBalance[]
          );

          return { postAccountRisk: profile.getAllRiskFactors() };
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}

export function buildTransaction(
  state$: Observable<BaseTradeState>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([state]) => state.canSubmit && state.confirm),
    distinctUntilChanged(
      ([p], [c]) => p.calculateInputKeys === c.calculateInputKeys
    ),
    switchMap(([s, a]) => {
      if (a) {
        const config = getTradeConfig(s.tradeType);
        return from(
          config.transactionBuilder({
            ...s,
            accountBalances: a.balances || [],
            address: a.address,
            network: a.network,
          })
        ).pipe(
          map((p) => ({ populatedTransaction: p })),
          catchError((e) => {
            // TODO: this should log to datadog
            console.error('Transaction Builder Error', e);
            return of({
              populatedTransaction: undefined,
              simulatedResults: undefined,
              transactionError: e.toString(),
            });
          })
        );
      }
      return EMPTY;
    }),
    filterEmpty()
  );
}
