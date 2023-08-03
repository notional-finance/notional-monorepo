import {
  AccountDefinition,
  BaseLiquidityPool,
  Registry,
  TokenBalance,
  TokenDefinition,
  VaultAdapter,
  fCashMarket,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  RiskFactorKeys,
  RiskFactorLimit,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { CalculationFnParams } from '@notional-finance/transaction';
import {
  RATE_PRECISION,
  filterEmpty,
  getNowSeconds,
} from '@notional-finance/util';
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
  bufferCount,
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import { isHashable } from '../utils';
import {
  BaseTradeState,
  TokenOption,
  TradeConfiguration,
  TradeType,
  VaultTradeConfiguration,
  VaultTradeState,
  VaultTradeType,
  isVaultTrade,
} from './base-trade-store';
import { selectedNetwork, selectedAccount } from './selectors';

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
  if (availableTokens.length === 1) return availableTokens[0];
  return availableTokens.find((t) => t.symbol === selectedToken);
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
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  global$: Observable<GlobalState>
) {
  return combineLatest([state$, selectedNetwork$, global$]).pipe(
    filter(
      ([{ isReady, vaultAddress }, selectedNetwork, { isAccountPending }]) =>
        !isReady && !!selectedNetwork && !!vaultAddress && !isAccountPending
    ),
    map(([{ vaultAddress }, selectedNetwork]) => {
      if (!vaultAddress) return undefined;
      else {
        try {
          const vaultConfig =
            Registry.getConfigurationRegistry().getVaultConfig(
              selectedNetwork,
              vaultAddress
            );
          return { isReady: true, vaultConfig };
        } catch {
          return undefined;
        }
      }
    }),
    filterEmpty()
  );
}

export function initState(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>,
  global$: Observable<GlobalState>
) {
  return combineLatest([state$, selectedNetwork$, global$]).pipe(
    filter(
      ([{ isReady, tradeType }, selectedNetwork, { isAccountPending }]) =>
        !isReady && !!selectedNetwork && !!tradeType && !isAccountPending
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
    map(([s, selectedNetwork, account]) => {
      const { collateralFilter, depositFilter, debtFilter } = getTradeConfig(
        s.tradeType
      );
      const listedTokens =
        Registry.getTokenRegistry().getAllTokens(selectedNetwork);

      // NOTE: selectedDepositToken is used via the URL string to set the deposit token, that is
      // first selected here and then we simulate the newState with this deposit token set before
      // we apply collateral and debt filters. This reduces race conditions and improves front end
      // performance.
      const availableDepositTokens = listedTokens
        .filter((t) => t.tokenType === 'Underlying')
        // By default we only allow tokens with a currency id specified (i.e. they are listed
        // on Notional)
        .filter((t) =>
          depositFilter ? depositFilter(t, account, s) : !!t.currencyId
        );
      const deposit = getSelectedToken(
        availableDepositTokens,
        s.selectedDepositToken || s.deposit?.symbol
      );
      const newState = Object.assign(s, { deposit });

      // Now apply collateral and debt filters against the `newState` object
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
          collateralFilter ? collateralFilter(t, account, newState) : true
        );

      const availableDebtTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeDebt' ||
            (t.tokenType === 'VaultDebt' &&
              (t.maturity || 0) > getNowSeconds()) ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false && // Always use positive fCash
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) => (debtFilter ? debtFilter(t, account, newState) : true));

      const hasChanged =
        availableCollateralTokens.map((t) => t.id).join(':') !==
          s.availableCollateralTokens?.map((t) => t.id).join(':') ||
        availableDebtTokens.map((t) => t.id).join(':') !==
          s.availableDebtTokens?.map((t) => t.id).join(':') ||
        availableDepositTokens.map((t) => t.id).join(':') !==
          s.availableDepositTokens?.map((t) => t.id).join(':');

      const debt = getSelectedToken(availableDebtTokens, s.debt?.symbol);
      const collateral = getSelectedToken(
        availableCollateralTokens,
        s.collateral?.symbol
      );

      return hasChanged
        ? {
            availableCollateralTokens,
            availableDebtTokens,
            availableDepositTokens,

            // Set the default values if only one is available
            deposit,
            debt,
            collateral,
            selectedDepositToken: deposit?.symbol,
          }
        : undefined;
    }),
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
    // NOTE: use a bufferCount(2, 1) here instead of pairwise to ensure that
    // we don't get race conditions around duplicate input keys. The second
    // parameter ensures that we start a new buffer on every emission
    bufferCount(2, 1),
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
              case 'deposit':
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
      const { calculationFn, requiredArgs } = getTradeConfig(tradeType);

      if (inputsSatisfied) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const outputs = calculationFn(inputs as any);

          return {
            ...u,
            ...outputs,
            calculateError,
            calculationSuccess: true,
          };
        } catch (e) {
          calculateError = (e as Error).toString();
        }
      }

      // NOTE: clear any calculated inputs if the new calculation fails
      const clearCalculatedInputs = requiredArgs.reduce((o, a) => {
        if (a === 'collateral') {
          return Object.assign(o, { collateralBalance: undefined });
        } else if (a === 'debt') {
          return Object.assign(o, { debtBalance: undefined });
        } else if (a === 'deposit') {
          return Object.assign(o, { depositBalance: undefined });
        } else {
          return o;
        }
      }, {});

      return {
        ...u,
        calculationSuccess: false,
        calculateError,
        ...clearCalculatedInputs,
      };
    }),
    map(({ inputs, collateralTokens, debtTokens, tradeType, ...u }) => {
      const {
        calculationFn,
        requiredArgs,
        calculateCollateralOptions,
        calculateDebtOptions,
      } = getTradeConfig(tradeType);

      let collateralOptions: TokenOption[] | undefined;
      let debtOptions: TokenOption[] | undefined;

      if (calculateCollateralOptions) {
        const satisfied = requiredArgs
          .filter((c) => c !== 'collateral')
          .every((r) => inputs[r] !== undefined);
        const collateralPool = inputs['collateralPool']
          ? (inputs['collateralPool'] as fCashMarket)
          : undefined;

        collateralOptions = satisfied
          ? collateralTokens?.map((c) => {
              const i = { ...inputs, collateral: c };
              let interestRate = collateralPool?.getSpotInterestRate(
                Registry.getTokenRegistry().unwrapVaultToken(c)
              );
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { collateralBalance } = calculationFn(i as any) as {
                  collateralBalance: TokenBalance;
                };

                if (
                  collateralPool &&
                  collateralBalance.unwrapVaultToken().tokenType === 'fCash'
                ) {
                  interestRate =
                    (collateralPool.getSlippageRate(
                      collateralBalance.unwrapVaultToken(),
                      0
                    ) *
                      100) /
                    RATE_PRECISION;
                }

                return {
                  token: c,
                  balance: collateralBalance,
                  interestRate,
                };
              } catch (e) {
                console.error(e);
                return {
                  token: c,
                  interestRate: undefined,
                  error: (e as Error).toString(),
                };
              }
            })
          : undefined;
      }

      if (calculateDebtOptions) {
        const satisfied = requiredArgs
          .filter((c) => c !== 'debt')
          .filter((c) => (isVaultTrade(tradeType) ? c !== 'collateral' : true))
          .every((r) => inputs[r] !== undefined);
        const debtPool = inputs['debtPool']
          ? (inputs['debtPool'] as fCashMarket)
          : undefined;

        debtOptions = satisfied
          ? debtTokens?.map((d) => {
              const i = { ...inputs, debt: d };
              try {
                const isVault = isVaultTrade(tradeType);
                if (isVault) {
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
                let interestRate: number | undefined;

                if (
                  debtPool &&
                  debtBalance.unwrapVaultToken().tokenType === 'fCash'
                ) {
                  // If there is a vault, apply the additional fee rate against the debt
                  const feeRate =
                    isVault && d.vaultAddress
                      ? Registry.getConfigurationRegistry().getVaultConfig(
                          d.network,
                          d.vaultAddress
                        ).feeRateBasisPoints
                      : 0;

                  interestRate =
                    (debtPool.getSlippageRate(
                      debtBalance.unwrapVaultToken(),
                      feeRate
                    ) *
                      100) /
                    RATE_PRECISION;
                }

                return {
                  token: d,
                  balance: debtBalance,
                  interestRate,
                };
              } catch (e) {
                console.error(e);
                return {
                  token: d,
                  interestRate: undefined,
                  error: (e as Error).toString(),
                };
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
        p.calculationSuccess === c.calculationSuccess &&
        p.depositBalance?.hashKey === c.depositBalance?.hashKey &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey
    ),
    map(([account, { calculationSuccess, collateralBalance, debtBalance }]) => {
      if (calculationSuccess && account) {
        const profile = AccountRiskProfile.simulate(
          account.balances.filter((t) => t.tokenType !== 'Underlying'),
          [collateralBalance, debtBalance].filter(
            (b) => b !== undefined
          ) as TokenBalance[]
        );
        const postAccountRisk = profile.getAllRiskFactors();

        return {
          postAccountRisk: postAccountRisk,
          canSubmit: postAccountRisk.freeCollateral.isPositive(),
          postTradeBalances: profile.balances,
        };
      } else if (!calculationSuccess) {
        return {
          postAccountRisk: undefined,
          canSubmit: false,
          postTradeBalances: undefined,
        };
      }

      return undefined;
    }),
    filterEmpty()
  );
}

export function priorVaultAccountRisk(
  state$: Observable<VaultTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    distinctUntilChanged(([p, prevA], [c, curA]) => {
      const mustComputeRisk =
        !!curA?.balances.filter((t) => t.token.vaultAddress === c.vaultAddress)
          ?.length && c.priorAccountRisk === undefined;
      return (
        p.vaultAddress === c.vaultAddress &&
        prevA?.address === curA?.address &&
        !mustComputeRisk
      );
    }),
    map(([{ vaultAddress, tradeType }, account]) => {
      if (!vaultAddress) return undefined;
      const priorVaultBalances =
        account?.balances.filter(
          (t) => t.token.vaultAddress === vaultAddress
        ) || [];

      // NOTE: default trade type is determined by the URL route or the presence
      // of a vault account.
      if (priorVaultBalances.length === 0) {
        return {
          tradeType: 'CreateVaultPosition' as VaultTradeType,
          priorVaultBalances,
        };
      } else {
        // If a vault account exists, then the default trade type is not selected
        return {
          tradeType:
            tradeType === 'CreateVaultPosition' ? undefined : tradeType,
          priorVaultBalances,
          priorAccountRisk: VaultAccountRiskProfile.from(
            vaultAddress,
            priorVaultBalances
          ).getAllRiskFactors(),
        };
      }
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
        p.calculationSuccess === c.calculationSuccess &&
        p.depositBalance?.hashKey === c.depositBalance?.hashKey &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey
    ),
    map(
      ([
        account,
        {
          calculationSuccess,
          collateralBalance,
          collateral,
          debtBalance,
          vaultAddress,
        },
      ]) => {
        if (calculationSuccess && vaultAddress && collateral) {
          const profile = VaultAccountRiskProfile.simulate(
            vaultAddress,
            account?.balances.filter((t) => t.tokenType !== 'Underlying') || [],
            [collateralBalance, debtBalance].filter(
              (b) => b !== undefined
            ) as TokenBalance[]
          );
          const postAccountRisk = profile.getAllRiskFactors();

          return {
            postAccountRisk,
            canSubmit:
              (postAccountRisk.leverageRatio === null ||
                postAccountRisk.leverageRatio < profile.maxLeverageRatio) &&
              account !== null,
            postTradeBalances: profile.balances,
          };
        } else if (!calculationSuccess) {
          return {
            postAccountRisk: undefined,
            canSubmit: false,
            postTradeBalances: undefined,
          };
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

export function defaultLeverageRatio(
  state$: Observable<BaseTradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return state$.pipe(
    filter(
      (s) =>
        !!s.vaultAddress ||
        s.tradeType === 'LeveragedLend' ||
        s.tradeType === 'LeveragedNToken'
    ),
    distinctUntilChanged((p, c) => {
      return (
        p.deposit?.id === c.deposit?.id &&
        p.debt?.id === c.debt?.id &&
        p.collateral?.id === c.collateral?.id &&
        p.tradeType === c.tradeType
      );
    }),
    withLatestFrom(selectedNetwork$),
    map(([s, network]) => {
      if (s.vaultAddress) {
        // Return from the configuration registry directly
        return Registry.getConfigurationRegistry().getVaultLeverageFactors(
          network,
          s.vaultAddress
        );
      }

      if (s.deposit === undefined) return undefined;
      const options = (
        s.tradeType === 'LeveragedLend'
          ? Registry.getYieldRegistry().getLeveragedLendYield(network)
          : Registry.getYieldRegistry().getLeveragedNTokenYield(network)
      )
        .filter((y) => y.underlying.id === s.deposit?.id)
        .filter((y) => (s.collateral ? y.token.id === s.collateral.id : true))
        .filter((y) =>
          s.debt ? y.leveraged?.debtToken.id === s.debt.id : true
        );

      return {
        minLeverageRatio: 0,
        // Return the max of the max leverage ratios...
        maxLeverageRatio: Math.max(
          ...options.map((y) => y.leveraged?.maxLeverageRatio || 0)
        ),
        // Return the min of the default leverage ratios...
        defaultLeverageRatio: Math.min(
          ...options.map((y) => y.leveraged?.leverageRatio || 0)
        ),
      };
    }),
    filterEmpty()
  );
}

export function tradeSummary(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([account$, state$]).pipe(
    distinctUntilChanged(
      ([, p], [, c]) =>
        // TODO: what to when can submit is false?
        p.canSubmit === c.canSubmit &&
        p.depositBalance?.hashKey === c.depositBalance?.hashKey &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.tradeType === c.tradeType
    ),
    map(
      ([account, { canSubmit, collateralBalance, debtBalance, tradeType }]) => {
        if (
          canSubmit &&
          account &&
          !collateralBalance?.isVaultToken &&
          !debtBalance?.isVaultToken
        ) {
          // Skip vault shares and vualt debt
          return getNetBalances(
            account.balances,
            tradeType === 'RollDebt'
              ? debtBalance
              : tradeType === 'ConvertAsset'
              ? collateralBalance
              : collateralBalance || debtBalance
          );
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}

function getNetBalances(
  accountBalances: TokenBalance[],
  netChange: TokenBalance | undefined
) {
  if (!netChange) return undefined;

  const zero = netChange.copy(0);
  const start =
    accountBalances.find((b) => b.tokenId === netChange.tokenId) || zero;
  const end = start.add(netChange);
  if ((start.isPositive() && end.isPositive()) || start.eq(end)) {
    // Only asset changes
    return { netAssetBalance: netChange, netDebtBalance: zero };
  } else if (start.lte(zero) && end.isNegative()) {
    // Only debt changes
    return { netAssetBalance: zero, netDebtBalance: netChange };
  } else if (end.lte(zero) && start.gt(zero)) {
    // Entire start balance has decreased to zero, entire negative balance is created
    return { netAssetBalance: start.neg(), netDebtBalance: end };
  } else if (start.lte(zero) && end.gt(zero)) {
    // Entire start balance has been repaid, entire positive balance is created
    return { netAssetBalance: end, netDebtBalance: start.neg() };
  }

  throw Error('unknown balance change');
}
