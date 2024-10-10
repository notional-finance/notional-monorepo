import { selectedNetwork } from '../../global';
import { filterEmpty } from '@notional-finance/util';
import {
  Observable,
  filter,
  distinctUntilChanged,
  withLatestFrom,
  map,
} from 'rxjs';
import {
  TradeState,
  VaultTradeState,
  isLeveragedTrade,
} from '../base-trade-store';

export function defaultLeverageRatio(
  state$: Observable<TradeState>,
  selectedNetwork$: ReturnType<typeof selectedNetwork>
) {
  return state$.pipe(
    filter((s) => isLeveragedTrade(s.tradeType)),
    distinctUntilChanged((p, c) => {
      return (
        p.deposit?.id === c.deposit?.id &&
        p.debt?.id === c.debt?.id &&
        p.collateral?.id === c.collateral?.id &&
        p.tradeType === c.tradeType
      );
    }),
    withLatestFrom(selectedNetwork$),
    map(() => undefined),
    /*
    // Ensures that the yield registry is ready before proceeding
    switchMap(([s, network]) => {
      return from(
        new Promise<[TradeState, NonNullable<Network | undefined>]>(
          (resolve) => {
            Registry.getYieldRegistry().onNetworkRegistered(network, () => {
              resolve([s, network]);
            });
          }
        )
      );
    }),
    map(([s, network]) => {
      if (s.deposit === undefined) return undefined;
      const { debt, collateral } = isDeleverageWithSwappedTokens(s)
        ? { debt: s.collateral, collateral: s.debt }
        : { debt: s.debt, collateral: s.collateral };

      const options = (
        s.tradeType === 'LeveragedLend'
          ? Registry.getYieldRegistry().getLeveragedLendYield(network)
          : Registry.getYieldRegistry().getLeveragedNTokenYield(network)
      )
        .filter((y) => y.underlying.id === s.deposit?.id)
        .filter((y) => (collateral ? y.token.id === collateral.id : true))
        .filter((y) =>
          debt
            ? // Need to flip the prime cash to prime debt during deleverage
              debt.tokenType === 'PrimeCash'
              ? y.leveraged?.debtToken.tokenType === 'PrimeDebt'
              : y.leveraged?.debtToken.id === debt.id
            : true
        );

      return {
        minLeverageRatio: 0,
        // Return the max of the max leverage ratios...
        maxLeverageRatio: Math.max(
          ...options.map((y) => y.leveraged?.maxLeverageRatio || 0)
        ),
        defaultLeverageRatio: options.find(
          (y) => y.leveraged?.debtToken?.id === debt?.id
        )?.leveraged?.leverageRatio,
      };
    }),
    */
    filterEmpty()
  );
}

export function defaultVaultLeverageRatio(state$: Observable<VaultTradeState>) {
  return state$.pipe(
    distinctUntilChanged((p, c) => {
      return (
        p.vaultAddress === c.vaultAddress &&
        p.selectedNetwork === c.selectedNetwork &&
        p.tradeType === c.tradeType
      );
    }),
    map(() => {
      return undefined;
      // return vaultAddress && selectedNetwork
      //   ? Registry.getConfigurationRegistry().getVaultLeverageFactors(
      //       selectedNetwork,
      //       vaultAddress
      //     )
      //   : undefined;
    }),
    filterEmpty()
  );
}
