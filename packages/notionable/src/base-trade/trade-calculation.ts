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
import { CalculationFnParams } from '@notional-finance/transaction';
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
import { BaseTradeState, TokenOption, isVaultTrade } from './base-trade-store';
import { getTradeConfig } from './logic';

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
    // Add this here to throttle calculations for the UI a bit.
    auditTime(100),
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
