import { applySimulationToAccount } from '@notional-finance/transaction';
import {
  logError,
  filterEmpty,
  IS_TEST_ENV,
  zipByKeyToArray,
  getNowSeconds,
  FLOATING_POINT_DUST,
} from '@notional-finance/util';
import {
  Observable,
  combineLatest,
  filter,
  switchMap,
  from,
  of,
  EMPTY,
  distinctUntilChanged,
  withLatestFrom,
  map,
} from 'rxjs';
import { selectedAccount, selectedNetwork } from '../../global';
import { BaseTradeState, isVaultTrade } from '../base-trade-store';
import { getTradeConfig } from '../trade-calculation';
import { AccountRiskProfile } from '@notional-finance/risk-engine';

export function buildTransaction(
  state$: Observable<BaseTradeState>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, account$]).pipe(
    switchMap(([s, a]) => {
      if (
        a &&
        s.canSubmit &&
        s.confirm &&
        s.populatedTransaction === undefined &&
        s.transactionError === undefined
      ) {
        const config = getTradeConfig(s.tradeType);
        // Using the risk profile here ensures that we use settled balances
        const accountBalances = isVaultTrade(s.tradeType)
          ? a.balances
          : new AccountRiskProfile(a.balances, a.network).balances;

        return from(
          config
            .transactionBuilder({
              ...s,
              accountBalances,
              vaultLastUpdateTime: a.vaultLastUpdateTime || {},
              address: a.address,
              network: a.network,
            })
            .then((p) => ({
              populatedTransaction: p,
              transactionError: undefined as string | undefined,
            }))
            .catch((e) => {
              // Log these errors in full to the console
              logError(e, 'base-trade#logic', 'buildTransaction', s, true);
              const _reason = e['reason'];
              const parsedReason = _reason.replace(/execution\sreverted:?/, '');
              const transactionError = parsedReason
                ? `Transaction will revert: ${parsedReason}`
                : 'Transaction will revert based on inputs.';

              return {
                transactionError,
              };
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
    distinctUntilChanged(
      ([p], [c]) =>
        p.populatedTransaction?.data === c.populatedTransaction?.data
    ),
    filter(([state]) => !!state.populatedTransaction && !IS_TEST_ENV),
    withLatestFrom(selectedNetwork$),
    switchMap(([[s, a], network]) => {
      const {
        populatedTransaction,
        postTradeBalances,
        vaultAddress,
        postTradeIncentives,
      } = s;
      if (populatedTransaction && a) {
        return from(
          applySimulationToAccount(network, populatedTransaction, a)
        ).pipe(
          map(({ balancesAfter }) => {
            const zippedBalances = zipByKeyToArray(
              balancesAfter.filter((t) => {
                if (vaultAddress) {
                  return t.isVaultToken && t.vaultAddress === vaultAddress;
                } else if (
                  postTradeIncentives?.find((i) => i.tokenId === t.tokenId)
                ) {
                  // Do not include incentive tokens in the check, this causes issues
                  // with the simulation for a token like ARB which is both listed and
                  // given out as an incentive. Prior balances are added which causes the
                  // check to break.
                  return false;
                } else {
                  return (
                    t.tokenType !== 'Underlying' &&
                    !t.isVaultToken &&
                    t.tokenType !== 'NOTE'
                  );
                }
              }),
              // Exclude vault cash from the balances check since it should always
              // be cleared anyway
              postTradeBalances?.filter((t) => t.tokenType !== 'VaultCash') ||
                [],
              (t) => t.tokenId
            );

            const mismatchedBalances = zippedBalances
              .map(([simulated, calculated]) => {
                let rel = 0;
                let abs = 0;
                if (
                  simulated?.symbol === 'ARB' ||
                  calculated?.symbol === 'ARB'
                ) {
                  rel = 0;
                  abs = 0;
                } else if (simulated && calculated) {
                  rel = calculated.isZero()
                    ? simulated.toFloat()
                    : (simulated.toFloat() - calculated.toFloat()) /
                      calculated.toFloat();
                  abs = simulated.toFloat() - calculated.toFloat();
                } else if (simulated) {
                  if (
                    simulated.token.maturity &&
                    simulated.token.maturity < getNowSeconds()
                  ) {
                    // This is a matured balance, it should be cleared to zero
                    rel = 0;
                    abs = 0;
                  } else {
                    rel = simulated.toFloat();
                    abs = simulated.toFloat();
                  }
                } else if (calculated) {
                  rel = calculated.toFloat();
                  abs = calculated.toFloat();
                }

                return {
                  rel,
                  abs,
                  simulatedBalance: simulated,
                  calculatedBalance: calculated,
                };
              })
              .filter(({ rel, abs }) => {
                return (
                  Math.abs(rel) > 5e-2 && Math.abs(abs) > FLOATING_POINT_DUST
                );
              });

            if (mismatchedBalances.length > 0) {
              logError(
                Error('Error in transaction simulation'),
                'base-trade',
                'simulateTransaction',
                { ...s, mismatchedBalances }
              );

              return {
                transactionError:
                  'Transaction simulation does not match calculated outputs.',
              };
            }

            return {
              transactionError: undefined,
            };
          })
        );
      }

      return EMPTY;
    }),
    filterEmpty()
  );
}
