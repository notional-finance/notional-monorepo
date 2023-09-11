import { Registry } from '@notional-finance/core-entities';
import { selectedNetwork } from '../../global';
import { filterEmpty } from '@notional-finance/util';
import {
  Observable,
  filter,
  distinctUntilChanged,
  withLatestFrom,
  map,
} from 'rxjs';
import { BaseTradeState } from '../base-trade-store';

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
