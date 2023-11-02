import {
  BaseLiquidityPool,
  VaultAdapter,
  AccountDefinition,
  TokenDefinition,
  TokenBalance,
  fCashMarket,
  Registry,
} from '@notional-finance/core-entities';
import { RiskFactorLimit, RiskFactorKeys } from '@notional-finance/risk-engine';
import {
  CalculationFn,
  CalculationFnParams,
} from '@notional-finance/transaction';
import { filterEmpty, RATE_PRECISION } from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  filter,
  bufferCount,
  auditTime,
  map,
} from 'rxjs';
import { isHashable } from '../utils';
import {
  BaseTradeState,
  TokenOption,
  TradeConfiguration,
  TradeType,
  VaultTradeConfiguration,
  VaultTradeType,
  isVaultTrade,
} from './base-trade-store';

export function getTradeConfig(tradeType?: TradeType | VaultTradeType) {
  if (!tradeType) throw Error('Trade type undefined');

  const config =
    TradeConfiguration[tradeType as TradeType] ||
    VaultTradeConfiguration[tradeType as VaultTradeType];

  if (!config) throw Error('Trade configuration not found');
  return config;
}

export function calculateMaxWithdraw(
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
    bufferCount(2, 1),
    // Add this here to throttle calculations for the UI a bit.
    auditTime(100),
    filter(
      ([[p], [s]]) =>
        s.isReady && !!s.tradeType && s.maxWithdraw && !p.maxWithdraw
    ),
    map(([_, [s, debtPool, collateralPool, a, vaultAdapter]]) => {
      const { requiredArgs } = getTradeConfig(s.tradeType);

      const { inputsSatisfied, inputs } = getRequiredArgs(
        requiredArgs,
        s,
        a,
        collateralPool,
        debtPool,
        vaultAdapter
      );

      const {
        netRealizedCollateralBalance,
        netRealizedDebtBalance,
        calculationSuccess,
        calculateError,
        debtFee,
        collateralFee,
        collateralBalance,
        debtBalance,
      } = executeCalculation(inputsSatisfied, s.tradeType, inputs) as {
        netRealizedDebtBalance: TokenBalance | undefined;
        netRealizedCollateralBalance: TokenBalance | undefined;
        debtFee: TokenBalance | undefined;
        collateralFee: TokenBalance | undefined;
        calculationSuccess: boolean;
        calculateError: string | undefined;
        collateralBalance: TokenBalance | undefined;
        debtBalance: TokenBalance | undefined;
      };

      return {
        inputsSatisfied,
        calculationSuccess,
        calculateError,
        netRealizedDebtBalance: netRealizedDebtBalance,
        netRealizedCollateralBalance: netRealizedCollateralBalance,
        debtFee,
        collateralFee,
        ...(s.tradeType === 'RollDebt' ? { debtBalance } : {}),
        ...(s.tradeType === 'ConvertAsset' ? { collateralBalance } : {}),
      };
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
    map(
      ([
        [p, _debtPool, _collateralPool, _a, _vaultAdapter],
        [s, debtPool, collateralPool, a, vaultAdapter],
      ]) => {
        // Need to calculate the previous input keys because the updates lag in
        // the state emission causing duplicate calculations.
        const {
          requiredArgs,
          calculateCollateralOptions,
          calculateDebtOptions,
        } = getTradeConfig(p.tradeType);

        // NOTE: need to use the same parameters in the previous state
        const { inputsSatisfied, keys } = getRequiredArgs(
          requiredArgs,
          p,
          _a,
          _collateralPool,
          _debtPool,
          _vaultAdapter
        );

        return {
          prevTradeType: p.tradeType,
          prevCalculateInputKeys: keys.join('|'),
          prevInputsSatisfied: inputsSatisfied,
          s,
          debtPool,
          collateralPool,
          a,
          vaultAdapter,
          requiredArgs,
          calculateCollateralOptions,
          calculateDebtOptions,
        };
      }
    ),
    map(
      ({
        prevTradeType,
        prevInputsSatisfied,
        prevCalculateInputKeys,
        s,
        debtPool,
        collateralPool,
        a,
        vaultAdapter,
        requiredArgs,
        calculateCollateralOptions,
        calculateDebtOptions,
      }) => {
        if (s.maxWithdraw) return undefined;

        const { inputsSatisfied, inputs, keys } = getRequiredArgs(
          requiredArgs,
          s,
          a,
          collateralPool,
          debtPool,
          vaultAdapter
        );

        const calculateInputKeys = keys.join('|');
        return prevInputsSatisfied !== inputsSatisfied ||
          prevCalculateInputKeys !== calculateInputKeys ||
          prevTradeType !== s.tradeType
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

      return {
        ...u,
        ...executeCalculation(inputsSatisfied, tradeType, inputs),
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

      if (
        calculateCollateralOptions &&
        collateralTokens &&
        requiredArgs
          .filter((c) => c !== 'collateral')
          .every((r) => inputs[r] !== undefined) &&
        inputs['collateralPool'] !== undefined
      ) {
        collateralOptions = computeCollateralOptions(
          inputs,
          calculationFn,
          collateralTokens,
          inputs['collateralPool'] as fCashMarket
        );
      }

      if (
        calculateDebtOptions &&
        debtTokens &&
        requiredArgs
          .filter((c) => c !== 'debt')
          .filter((c) => (isVaultTrade(tradeType) ? c !== 'collateral' : true))
          .every((r) => inputs[r] !== undefined) &&
        inputs['debtPool'] !== undefined
      ) {
        debtOptions = computeDebtOptions(
          inputs,
          calculationFn,
          debtTokens,
          inputs['debtPool'] as fCashMarket,
          tradeType
        );
      }

      return { ...u, collateralOptions, debtOptions };
    })
  );
}

function getRequiredArgs(
  requiredArgs: CalculationFnParams[],
  s: BaseTradeState,
  a: AccountDefinition | null,
  collateralPool: BaseLiquidityPool<unknown> | undefined,
  debtPool: BaseLiquidityPool<unknown> | undefined,
  vaultAdapter: VaultAdapter | undefined
) {
  const { vaultAddress } = s;
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
        case 'vaultLastUpdateTime':
          return [
            Object.assign(inputs, {
              vaultLastUpdateTime:
                a?.vaultLastUpdateTime && vaultAddress
                  ? a.vaultLastUpdateTime[vaultAddress]
                  : undefined,
            }),
            [
              ...keys,
              ...(a?.vaultLastUpdateTime && vaultAddress
                ? a.vaultLastUpdateTime[vaultAddress].toString()
                : ''),
            ],
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
          const risk = s[r] as RiskFactorLimit<RiskFactorKeys> | undefined;
          return [
            Object.assign(inputs, { [r]: risk }),
            [
              ...keys,
              `${risk?.riskFactor}:${
                isHashable(risk?.limit)
                  ? risk?.limit.hashKey
                  : risk?.limit.toString()
              }:${risk?.args
                ?.map((t) => (typeof t === 'number' ? t : t?.id))
                .join(':')}`,
            ],
          ];
        }
        case 'maxCollateralSlippage':
        case 'maxDebtSlippage':
          return [
            Object.assign(inputs, { [r]: s[r] }),
            [...keys, (s[r] as number | undefined)?.toString() || ''],
          ];
        case 'maxWithdraw':
          return [
            Object.assign(inputs, { [r]: s[r] }),
            [...keys, (s[r] as boolean | undefined)?.toString() || ''],
          ];
        default:
          return [inputs, keys];
      }
    },
    [{} as Record<CalculationFnParams, unknown>, [] as string[]]
  );

  const inputsSatisfied = requiredArgs.every((r) => inputs[r] !== undefined);

  return {
    inputsSatisfied,
    inputs,
    keys,
  };
}

function executeCalculation(
  inputsSatisfied: boolean,
  tradeType: TradeType | VaultTradeType | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputs: any
) {
  const { calculationFn, requiredArgs } = getTradeConfig(tradeType);
  let calculateError: string | undefined;
  if (inputsSatisfied) {
    try {
      const outputs = calculationFn(inputs);

      return {
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
    if (a === 'collateral' && tradeType !== 'RollDebt') {
      return Object.assign(o, { collateralBalance: undefined });
    } else if (a === 'debt' && tradeType !== 'ConvertAsset') {
      return Object.assign(o, { debtBalance: undefined });
    } else if (a === 'deposit') {
      return Object.assign(o, { depositBalance: undefined });
    } else {
      return o;
    }
  }, {});

  return {
    calculationSuccess: false,
    calculateError,
    ...clearCalculatedInputs,
  };
}

function computeCollateralOptions(
  inputs: Record<CalculationFnParams, unknown>,
  calculationFn: CalculationFn,
  options: TokenDefinition[],
  fCashMarket: fCashMarket
): TokenOption[] | undefined {
  return options.map((c) => {
    const i = { ...inputs, collateral: c };
    try {
      const { collateralBalance, netRealizedCollateralBalance } = calculationFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i as any
      ) as {
        collateralBalance: TokenBalance;
        netRealizedCollateralBalance: TokenBalance;
      };

      return {
        token: c,
        balance: collateralBalance,
        interestRate: _getTradedInterestRate(
          netRealizedCollateralBalance,
          collateralBalance,
          fCashMarket
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        token: c,
        interestRate: undefined,
        error: (e as Error).toString(),
      };
    }
  });
}

function computeDebtOptions(
  inputs: Record<CalculationFnParams, unknown>,
  calculationFn: CalculationFn,
  options: TokenDefinition[],
  fCashMarket: fCashMarket,
  tradeType: TradeType | VaultTradeType | undefined
) {
  return options.map((d) => {
    const i = { ...inputs, debt: d };
    try {
      if (isVaultTrade(tradeType)) {
        // Switch to the matching vault share token for vault trades
        if (!d.vaultAddress || !d.maturity) throw Error('Invalid debt token');
        i['collateral'] = Registry.getTokenRegistry().getVaultShare(
          d.network,
          d.vaultAddress,
          d.maturity
        );
      }

      const { debtBalance, netRealizedDebtBalance } = calculationFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i as any
      ) as {
        debtBalance: TokenBalance;
        netRealizedDebtBalance: TokenBalance;
      };

      return {
        token: d,
        balance: debtBalance,
        interestRate: _getTradedInterestRate(
          netRealizedDebtBalance,
          debtBalance.unwrapVaultToken(),
          fCashMarket,
          tradeType
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        token: d,
        interestRate: undefined,
        error: (e as Error).toString(),
      };
    }
  });
}

function _getTradedInterestRate(
  realized: TokenBalance,
  amount: TokenBalance,
  fCashMarket: fCashMarket,
  tradeType?: TradeType | VaultTradeType
) {
  let interestRate: number | undefined;
  if (amount.tokenType === 'fCash') {
    interestRate = fCashMarket.getImpliedInterestRate(realized, amount);
  } else if (amount.tokenType === 'PrimeCash') {
    // Increases or decreases the prime supply accordingly
    const utilization = fCashMarket.getPrimeCashUtilization(amount, undefined);
    interestRate = fCashMarket.getPrimeSupplyRate(utilization);
  } else if (
    amount.tokenType === 'PrimeDebt' &&
    (tradeType === 'LeveragedLend' || tradeType === 'LeveragedNToken')
  ) {
    // If borrowing for leverage it is prime supply + prime debt
    const utilization = fCashMarket.getPrimeCashUtilization(
      amount.toPrimeCash().neg(),
      amount.neg()
    );
    interestRate = fCashMarket.getPrimeDebtRate(utilization);
  } else if (amount.tokenType === 'PrimeDebt') {
    // If borrowing and withdrawing then it is just prime debt increase. This
    // includes vault debt
    const utilization = fCashMarket.getPrimeCashUtilization(
      undefined,
      amount.neg()
    );
    interestRate = fCashMarket.getPrimeDebtRate(utilization);
  } else if (amount.tokenType === 'nToken') {
    return Registry.getYieldRegistry().getSimulatedNTokenYield(amount)
      ?.totalAPY;
  }

  return interestRate !== undefined
    ? (interestRate * 100) / RATE_PRECISION
    : undefined;
}
