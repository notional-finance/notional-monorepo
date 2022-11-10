import { TypedBigNumber, VaultConfig } from '@notional-finance/sdk';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import BaseVault from '@notional-finance/sdk/src/vaults/BaseVault';
import VaultFactory from '@notional-finance/sdk/src/vaults/VaultFactory';
import { useNotional } from '../notional/use-notional';

export const useVault = (vaultAddress?: string) => {
  const { system } = useNotional();
  const vaultConfig = vaultAddress ? system?.getVault(vaultAddress) : undefined;
  let primaryBorrowCurrency: number | undefined = undefined;
  let primaryBorrowSymbol: string | undefined = undefined;
  let minBorrowSize: string | undefined = undefined;
  let minAccountBorrowSize: TypedBigNumber | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let strategyName = '';
  let minLeverageRatio = 0;
  let defaultLeverageRatio = 0;
  let maxLeverageRatio: number = defaultLeverageRatio;

  if (vaultConfig && system) {
    primaryBorrowCurrency = vaultConfig.primaryBorrowCurrency;
    primaryBorrowSymbol = system.getUnderlyingSymbol(primaryBorrowCurrency);
    minBorrowSize = vaultConfig.minAccountBorrowSize.toDisplayStringWithSymbol(0);
    minAccountBorrowSize = vaultConfig.minAccountBorrowSize;
    strategyName = VaultFactory.resolveStrategyName(vaultConfig.strategy) || '';
    minDepositRequired = getMinDepositRequiredString(vaultConfig);
    minLeverageRatio = BaseVault.collateralToLeverageRatio(
      vaultConfig.maxRequiredAccountCollateralRatioBasisPoints
    );
    defaultLeverageRatio = BaseVault.collateralToLeverageRatio(
      vaultConfig.maxDeleverageCollateralRatioBasisPoints
    );
    maxLeverageRatio = BaseVault.collateralToLeverageRatio(
      vaultConfig.minCollateralRatioBasisPoints
    );
  }

  return {
    vaultConfig,
    vaultAddress,
    vaultName: vaultConfig?.name,
    primaryBorrowCurrency,
    minBorrowSize,
    minAccountBorrowSize,
    primaryBorrowSymbol,
    strategyName,
    defaultLeverageRatio,
    maxLeverageRatio,
    minLeverageRatio,
    minDepositRequired,
  };
};

export function getMinDepositRequiredString(vaultConfig: VaultConfig) {
  const lowerDeposit = vaultConfig.minAccountBorrowSize
    .scale(vaultConfig.maxDeleverageCollateralRatioBasisPoints, RATE_PRECISION)
    .toDisplayStringWithSymbol(2);

  const upperDeposit = vaultConfig.minAccountBorrowSize
    .scale(vaultConfig.maxRequiredAccountCollateralRatioBasisPoints, RATE_PRECISION)
    .toDisplayStringWithSymbol(2);
  return `${lowerDeposit} to ${upperDeposit}`;
}
