import {
  AccountDefinition,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  IS_TEST_ENV,
  filterEmpty,
  getNowSeconds,
  logError,
  zipByKeyToArray,
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
} from 'rxjs';
import { GlobalState } from '../global/global-state';
import {
  BaseTradeState,
  TradeConfiguration,
  TradeState,
  TradeType,
  VaultTradeConfiguration,
  VaultTradeState,
  VaultTradeType,
} from './base-trade-store';
import { selectedNetwork, selectedAccount } from './selectors';
import { applySimulationToAccount } from '@notional-finance/transaction';

export function getTradeConfig(tradeType?: TradeType | VaultTradeType) {
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
            t.tokenType === 'nToken' ||
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

export function priorAccountRisk(
  state$: Observable<TradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([s, account]) => !!account && s.priorAccountRisk === undefined),
    map(([, account]) =>
      account
        ? {
            priorAccountRisk: AccountRiskProfile.from(
              account.balances
            ).getAllRiskFactors(),
          }
        : undefined
    ),
    filterEmpty()
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
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey
    ),
    map(([account, { calculationSuccess, collateralBalance, debtBalance }]) => {
      if (calculationSuccess && (collateralBalance || debtBalance)) {
        const profile = AccountRiskProfile.simulate(
          account?.balances.filter((t) => t.tokenType !== 'Underlying') || [],
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
        p.tradeType === c.tradeType &&
        prevA?.address === curA?.address &&
        !mustComputeRisk
      );
    }),
    map(([{ vaultAddress, tradeType, defaultLeverageRatio }, account]) => {
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
        const priorAccountRisk = VaultAccountRiskProfile.from(
          vaultAddress,
          priorVaultBalances
        ).getAllRiskFactors();

        const leverageRatio =
          tradeType === 'IncreaseVaultPosition' ||
          tradeType === 'WithdrawAndRepayVault'
            ? priorAccountRisk.leverageRatio || undefined
            : defaultLeverageRatio;

        // If a vault account exists, then the default trade type is not selected
        return {
          tradeType:
            tradeType === 'CreateVaultPosition' ? undefined : tradeType,
          priorVaultBalances,
          priorAccountRisk,
          defaultLeverageRatio: leverageRatio,
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
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey
    ),
    map(
      ([
        account,
        {
          calculationSuccess,
          collateralBalance,
          debtBalance,
          vaultAddress,
          tradeType,
        },
      ]) => {
        if (calculationSuccess && vaultAddress && collateralBalance) {
          const profile = VaultAccountRiskProfile.simulate(
            vaultAddress,
            account?.balances.filter((t) =>
              // During a roll vault position, new debt and collateral will be specified
              tradeType === 'RollVaultPosition'
                ? false
                : t.isVaultToken && t.vaultAddress === vaultAddress
            ) || [],
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
    filter(([state]) => state.canSubmit),
    switchMap(([s, a]) => {
      if (a && s.confirm && s.populatedTransaction === undefined) {
        const config = getTradeConfig(s.tradeType);
        return from(
          config.transactionBuilder({
            ...s,
            accountBalances: a.balances || [],
            address: a.address,
            network: a.network,
          })
        ).pipe(
          map((p) => ({
            populatedTransaction: p,
            transactionError: undefined,
          })),
          catchError((e) => {
            logError(e, 'base-trade#logic', 'buildTransaction', s);
            return of({
              populatedTransaction: undefined,
              transactionError: e.toString(),
              confirm: false,
            });
          })
        );
      } else if (s.confirm === false && !!s.populatedTransaction) {
        // Clear the populated transaction if confirmation is cancelled
        return of({
          populatedTransaction: undefined,
          transactionError: undefined,
        });
      }

      return EMPTY;
    }),
    filterEmpty()
  );
}

export function simulateTransaction(
  state$: Observable<BaseTradeState>,
  account$: ReturnType<typeof selectedAccount>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([state]) => !!state.populatedTransaction && !IS_TEST_ENV),
    distinctUntilChanged(
      ([p], [c]) =>
        p.populatedTransaction?.data === c.populatedTransaction?.data
    ),
    withLatestFrom(selectedNetwork$),
    switchMap(([[s, a], network]) => {
      const { populatedTransaction, postTradeBalances, vaultAddress } = s;
      if (populatedTransaction && a) {
        return from(
          applySimulationToAccount(network, populatedTransaction, a)
        ).pipe(
          map(({ balancesAfter }) => {
            const mismatchedBalances = zipByKeyToArray(
              balancesAfter.filter((t) =>
                vaultAddress
                  ? t.isVaultToken && t.vaultAddress === vaultAddress
                  : t.tokenType !== 'Underlying' && !t.isVaultToken
              ),
              postTradeBalances || [],
              (t) => t.tokenId
            )
              .map(([a, b]) => (!!a && !!b ? a.sub(b) : a || b) as TokenBalance)
              .filter((b) => b.abs().toFloat() > 5e-5);

            if (mismatchedBalances.length > 0) {
              logError(
                Error('Error in transaction simulation'),
                'base-trade',
                'simulateTransaction',
                { ...s, mismatchedBalances }
              );

              // TODO: figure out what the UI response is here...
              return {
                transactionError: 'Error in transaction simulation',
                populatedTransaction: undefined,
              };
            }

            return undefined;
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
        const leverageFactors =
          Registry.getConfigurationRegistry().getVaultLeverageFactors(
            network,
            s.vaultAddress
          );
        if (s.tradeType === 'CreateVaultPosition') {
          // Return from the configuration registry directly
          return leverageFactors;
        } else if (
          s.tradeType === 'IncreaseVaultPosition' ||
          s.tradeType === 'WithdrawAndRepayVault'
        ) {
          // Inside these two trade types, the default leverage ratio is defined
          // by the prior account risk
          return {
            minLeverageRatio: leverageFactors.minLeverageRatio,
            maxLeverageRatio: leverageFactors.maxLeverageRatio,
          };
        }
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
          // Skip vault shares and vault debt
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
  if (start.eq(end) || (start.gte(zero) && end.gte(zero))) {
    // Only asset changes
    return { netAssetBalance: netChange, netDebtBalance: zero };
  } else if (start.lte(zero) && end.lte(zero)) {
    // Only debt changes
    return { netAssetBalance: zero, netDebtBalance: netChange };
  } else if (start.gte(zero) && end.lte(zero)) {
    // Entire start balance has decreased to zero, entire negative balance is created
    return { netAssetBalance: start.neg(), netDebtBalance: end };
  } else if (start.lte(zero) && end.gte(zero)) {
    // Entire start balance has been repaid, entire positive balance is created
    return { netAssetBalance: end, netDebtBalance: start.neg() };
  }

  throw Error('unknown balance change');
}
