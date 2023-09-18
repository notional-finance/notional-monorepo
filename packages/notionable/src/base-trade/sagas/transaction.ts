import { TokenBalance } from '@notional-finance/core-entities';
import { applySimulationToAccount } from '@notional-finance/transaction';
import {
  logError,
  filterEmpty,
  IS_TEST_ENV,
  zipByKeyToArray,
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
import { BaseTradeState } from '../base-trade-store';
import { getTradeConfig } from '../trade-calculation';

export function buildTransaction(
  state$: Observable<BaseTradeState>,
  account$: ReturnType<typeof selectedAccount>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([state]) => state.canSubmit),
    switchMap(([s, a]) => {
      if (
        a &&
        s.confirm &&
        s.populatedTransaction === undefined &&
        s.transactionError === undefined
      ) {
        const config = getTradeConfig(s.tradeType);
        return from(
          config
            .transactionBuilder({
              ...s,
              accountBalances: a.balances || [],
              vaultLastUpdateTime: a.vaultLastUpdateTime || {},
              address: a.address,
              network: a.network,
            })
            .then((p) => ({
              populatedTransaction: p,
              transactionError: undefined as string | undefined,
            }))
            .catch((e) => {
              logError(e, 'base-trade#logic', 'buildTransaction', s);
              return {
                transactionError: 'Transaction will revert based on inputs.',
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
        tradeType,
      } = s;
      if (populatedTransaction && a) {
        return from(
          applySimulationToAccount(network, populatedTransaction, a)
        ).pipe(
          map(({ balancesAfter }) => {
            const zippedBalances = zipByKeyToArray(
              balancesAfter.filter((t) =>
                vaultAddress
                  ? t.isVaultToken && t.vaultAddress === vaultAddress
                  : t.tokenType !== 'Underlying' && !t.isVaultToken
              ),
              // Exclude vault cash from the balances check since it should always
              // be cleared anyway
              postTradeBalances?.filter((t) => t.tokenType !== 'VaultCash') ||
                [],
              (t) => t.tokenId
            );

            const mismatchedBalances = zippedBalances
              .map(([simulated, calculated]) => ({
                rel:
                  !!simulated && !!calculated && !calculated.isZero()
                    ? (simulated.toFloat() - calculated.toFloat()) /
                      calculated.toFloat()
                    : simulated
                    ? simulated.abs().toFloat()
                    : (calculated as TokenBalance).abs().toFloat(),
                abs:
                  !!simulated && !!calculated
                    ? simulated.toFloat() - calculated.toFloat()
                    : simulated?.abs().toFloat() ||
                      (calculated as TokenBalance).abs().toFloat(),
                simulatedBalance: simulated,
                calculatedBalance: calculated,
              }))
              .filter(({ rel, abs, simulatedBalance }) =>
                // Allow for more tolerance in this scenario since we do not accurately account
                // for dust repayment within the calculation. The actual amount of vault shares
                // is relatively insignificant.
                tradeType === 'RollVaultPosition' &&
                simulatedBalance?.tokenType === 'VaultShare'
                  ? Math.abs(rel) > 5e-2 && Math.abs(abs) > 5e-5
                  : Math.abs(rel) > 5e-4 && Math.abs(abs) > 5e-5
              );

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
