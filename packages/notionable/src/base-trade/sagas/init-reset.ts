import { Registry } from '@notional-finance/core-entities';
import { GlobalState, selectedNetwork } from '../../global';
import { filterEmpty } from '@notional-finance/util';
import {
  Observable,
  pairwise,
  withLatestFrom,
  map,
  combineLatest,
  filter,
} from 'rxjs';
import { BaseTradeState, VaultTradeState } from '../base-trade-store';

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
      if (
        !isVault &&
        prev.tradeType !== undefined &&
        prev.tradeType !== cur.tradeType
      ) {
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
      } else if (isVault && prev.tradeType !== cur.tradeType) {
        return {
          riskFactorLimit: undefined,
          postAccountRisk: undefined,
          postTradeBalances: undefined,
          collateral: undefined,
          debt: undefined,
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
