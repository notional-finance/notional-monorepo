import { BaseVault, RATE_PRECISION, TypedBigNumber, VaultFactory } from '@notional-finance/sdk';
import { Market } from '@notional-finance/sdk/src/system';
import { getNowSeconds, logError, PORTFOLIO_ACTIONS, VAULT_ACTIONS } from '@notional-finance/utils';
import { useObservableState } from 'observable-hooks';
import { vaultState$, initialVaultState } from '@notional-finance/notionable';
import { useNotional } from '../notional/use-notional';
import { useAccount } from './use-account';

interface YieldStrategies {
  strategyName: string;
  currencySymbol: string;
  assetValue: TypedBigNumber;
  netWorth: TypedBigNumber;
  isLeveragedVault: boolean;
  maturity?: number;
  debtValue?: TypedBigNumber;
  leverageRatio?: number;
  maxLeverageRatio?: number;
  leveragePercentage?: number;
  routes: {
    deleveragePosition?: string;
    increasePosition?: string;
    withdrawPosition?: string;
    rollPosition?: string;
    stakeNOTE?: string;
    unstakeNOTE?: string;
  };
}

export function useYieldStrategies(onlyLeveragedVaults: boolean): YieldStrategies[] {
  const { system } = useNotional();
  const { accountDataCopy: accountData, noteSummary } = useAccount();
  const { activeVaultMarkets } = useObservableState(vaultState$, initialVaultState);

  if (!system) return [];

  const leveragedVaultPositions: YieldStrategies[] = accountData.vaultAccounts.map(
    (vaultAccount) => {
      const vaultConfig = vaultAccount.getVault();
      const activeMarketKeys = activeVaultMarkets.get(vaultConfig.vaultAddress) || [];
      const currencySymbol = system.getUnderlyingSymbol(vaultConfig.primaryBorrowCurrency);
      const cashGroup = system.getCashGroup(vaultConfig.primaryBorrowCurrency);
      const debtValue = cashGroup.getfCashPresentValueUnderlyingInternal(
        vaultAccount.maturity,
        vaultAccount.primaryBorrowfCash,
        false
      );
      const maxLeverageRatio = BaseVault.collateralToLeverageRatio(
        vaultConfig.minCollateralRatioBasisPoints
      );

      let assetValue = TypedBigNumber.fromBalance(0, currencySymbol, true);
      let leverageRatio: number | undefined;
      let leveragePercentage: number | undefined;
      let mustDeleverage = false;
      try {
        const baseVault = VaultFactory.buildVaultFromCache(
          vaultConfig.strategy,
          vaultConfig.vaultAddress
        );
        assetValue = baseVault.getCashValueOfShares(vaultAccount).toUnderlying(true);
        leverageRatio = baseVault.getLeverageRatio(vaultAccount);
        leveragePercentage = (leverageRatio / maxLeverageRatio) * 100;
        mustDeleverage = leveragePercentage > 70;
      } catch (e) {
        logError(e as Error, 'notionable/account', 'use-yield-strategies');
      }

      const canIncreasePosition =
        activeMarketKeys.find((k) => Market.parseMaturity(k) === vaultAccount.maturity) !==
        undefined;
      const canRollPosition =
        vaultAccount.maturity > getNowSeconds() &&
        activeMarketKeys.find((k) => Market.parseMaturity(k) > vaultAccount.maturity) !== undefined;

      return {
        strategyName: vaultConfig.name,
        currencySymbol,
        maturity: vaultAccount.maturity,
        assetValue,
        debtValue,
        // NOTE: debt value is negative
        netWorth: debtValue ? assetValue.add(debtValue) : assetValue,
        leverageRatio,
        maxLeverageRatio,
        leveragePercentage,
        isLeveragedVault: true,
        routes: {
          increasePosition: canIncreasePosition
            ? `/vaults/${vaultConfig.vaultAddress}?vaultAction=${VAULT_ACTIONS.INCREASE_POSITION}`
            : undefined,
          rollPosition: canRollPosition
            ? `/vaults/${vaultConfig.vaultAddress}?vaultAction=${VAULT_ACTIONS.ROLL_POSITION}`
            : undefined,
          withdrawPosition: `${PORTFOLIO_ACTIONS.WITHDRAW_VAULT}?vaultAddress=${vaultConfig.vaultAddress}`,
          deleveragePosition: mustDeleverage
            ? `${PORTFOLIO_ACTIONS.DELEVERAGE_VAULT}?vaultAddress=${vaultConfig.vaultAddress}&action=${PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_SELL_ASSETS}`
            : undefined,
        },
      };
    }
  );

  if (onlyLeveragedVaults || !noteSummary) {
    return leveragedVaultPositions;
  } else {
    const assetValue = noteSummary.getStakedNoteValue();
    // Only return the staked note info if there is a sNOTE position
    return assetValue.isZero()
      ? leveragedVaultPositions
      : leveragedVaultPositions.concat([
          {
            strategyName: 'Staked NOTE',
            currencySymbol: 'sNOTE',
            assetValue,
            netWorth: assetValue,
            isLeveragedVault: false,
            routes: {
              stakeNOTE: '/stake',
              unstakeNOTE: '/unstake',
            },
          },
        ]);
  }
}
