import { BaseVault, TypedBigNumber, VaultFactory } from '@notional-finance/sdk';
import { useLocation } from 'react-router-dom';
import { logError } from '@notional-finance/helpers';
import { useNotional } from '../notional/use-notional';
import { useAccount } from './use-account';

interface YieldStrategies {
  strategyName: string;
  currencySymbol: string;
  assetValue: TypedBigNumber;
  netWorth: TypedBigNumber;
  isLeveragedVault: boolean;
  profit?: TypedBigNumber;
  maturity?: number;
  apy?: number;
  debtValue?: TypedBigNumber;
  leverageRatio?: number;
  maxLeverageRatio?: number;
  leveragePercentage?: number;
  routes: {
    manageVault?: string;
    stakeNOTE?: string;
    unstakeNOTE?: string;
  };
}

export function useYieldStrategies(
  onlyLeveragedVaults: boolean
): YieldStrategies[] {
  const { system } = useNotional();
  const { pathname: currentPath } = useLocation();
  const { accountDataCopy: accountData, noteSummary } = useAccount();

  if (!system) return [];

  const leveragedVaultPositions: YieldStrategies[] =
    accountData.vaultAccounts.map((vaultAccount) => {
      const vaultConfig = vaultAccount.getVault();
      // const activeMarketKeys =
      //   activeVaultMarkets.get(vaultConfig.vaultAddress) || [];
      const currencySymbol = system.getUnderlyingSymbol(
        vaultConfig.primaryBorrowCurrency
      );
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
      // let mustDeleverage = false;
      try {
        const baseVault = VaultFactory.buildVaultFromCache(
          vaultConfig.strategy,
          vaultConfig.vaultAddress
        );
        assetValue = baseVault
          .getCashValueOfShares(vaultAccount)
          .toUnderlying(true);
        leverageRatio = baseVault.getLeverageRatio(vaultAccount);
        leveragePercentage = (leverageRatio / maxLeverageRatio) * 100;
        // mustDeleverage = leveragePercentage > 70;
      } catch (e) {
        if ((e as Error).message.match('Vault at 0x.* not found') === null) {
          logError(e as Error, 'notionable/account', 'use-yield-strategies');
        }
      }

      const { netCashDeposited } = accountData.getVaultHistoricalFactors(
        vaultAccount.vaultAddress
      );
      const apy = 0;

      // NOTE: debt value is negative
      const netWorth = debtValue ? assetValue.add(debtValue) : assetValue;
      const profit = netWorth.sub(netCashDeposited);

      return {
        strategyName: vaultConfig.name,
        currencySymbol,
        maturity: vaultAccount.maturity,
        assetValue,
        debtValue,
        netWorth,
        profit,
        apy,
        netCashDeposited,
        leverageRatio,
        maxLeverageRatio,
        leveragePercentage,
        isLeveragedVault: true,
        routes: {
          manageVault: `${currentPath}/manage-vault/?vaultAddress=${vaultConfig.vaultAddress}`,
        },
      };
    });

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
