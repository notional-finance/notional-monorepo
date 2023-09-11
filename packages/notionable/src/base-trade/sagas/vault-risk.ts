import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { VaultTradeState } from '../base-trade-store';
import { VaultTradeType } from '../vault-trade-config';

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
      const vaultProfile = account
        ? VaultAccountRiskProfile.fromAccount(vaultAddress, account)
        : undefined;

      // NOTE: default trade type is determined by the URL route or the presence
      // of a vault account.
      if (!vaultProfile) {
        return {
          tradeType: 'CreateVaultPosition' as VaultTradeType,
          priorVaultBalances: [],
        };
      } else {
        const priorAccountRisk = vaultProfile.getAllRiskFactors();

        let leverageRatio = defaultLeverageRatio;
        if (tradeType === 'IncreaseVaultPosition') {
          leverageRatio = priorAccountRisk.leverageRatio || undefined;
        } else if (tradeType === 'WithdrawAndRepayVault') {
          leverageRatio =
            priorAccountRisk.leverageRatio &&
            priorAccountRisk.leverageRatio > 0.01
              ? priorAccountRisk.leverageRatio - 0.01
              : undefined;
        }

        // If a vault account exists, then the default trade type is not selected
        return {
          tradeType:
            tradeType === 'CreateVaultPosition' ? undefined : tradeType,
          priorVaultBalances: vaultProfile.balances,
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
        p.tradeType === c.tradeType &&
        p.calculationSuccess === c.calculationSuccess &&
        p.collateralBalance?.hashKey === c.collateralBalance?.hashKey &&
        p.debtBalance?.hashKey === c.debtBalance?.hashKey &&
        p.inputErrors === c.inputErrors
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
          inputErrors,
        },
      ]) => {
        if (tradeType === undefined || !calculationSuccess) {
          return {
            postAccountRisk: undefined,
            canSubmit: false,
            confirm: false,
            postTradeBalances: undefined,
          };
        } else if (calculationSuccess && vaultAddress && collateralBalance) {
          // NOTE: lastUpdateBlockTime is not relevant when calculating post trade balances
          // because the accrued debt will be factored into the calculation for the final
          // collateral and debt balance.
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
              account !== null &&
              inputErrors === false,
            postTradeBalances: profile.balances.concat(
              profile.settledBalances.map((s) => s.copy(0))
            ),
          };
        }

        return undefined;
      }
    ),
    filterEmpty()
  );
}
