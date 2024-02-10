import { Registry } from '@notional-finance/core-entities';
import { filterEmpty } from '@notional-finance/util';
import { Observable, pairwise, map, filter, distinctUntilChanged } from 'rxjs';
import { BaseTradeState, VaultTradeState } from '../base-trade-store';

export function resetOnTradeTypeChange(
  state$: Observable<BaseTradeState>,
  isVault = false
) {
  return state$.pipe(
    filterEmpty(),
    pairwise(),
    map(([prev, cur]) => {
      if (
        isVault &&
        prev.vaultAddress !== undefined &&
        prev.vaultAddress !== cur.vaultAddress
      ) {
        return {
          reset: true,
          selectedNetwork: cur.selectedNetwork,
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

export function initVaultState(state$: Observable<VaultTradeState>) {
  return state$.pipe(
    distinctUntilChanged(
      (p, c) =>
        p.vaultAddress === c.vaultAddress &&
        p.selectedNetwork === c.selectedDepositToken
    ),
    map(({ vaultAddress, selectedNetwork, isReady }) => {
      if (!vaultAddress || !selectedNetwork || isReady) return undefined;
      try {
        const vaultConfig = Registry.getConfigurationRegistry().getVaultConfig(
          selectedNetwork,
          vaultAddress
        );
        return { isReady: true, vaultConfig };
      } catch {
        return undefined;
      }
    }),
    filterEmpty()
  );
}

export function initState(state$: Observable<BaseTradeState>) {
  return state$.pipe(
    filter(
      ({ isReady, tradeType, selectedNetwork }) =>
        !isReady && !!selectedNetwork && !!tradeType
    ),
    map(() => ({ isReady: true }))
  );
}
