import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { reportNotionalError } from '@notional-finance/notionable';
import { RATE_PRECISION } from '@notional-finance/util';
import { useAccountDefinition } from '../account/use-account';
import { useSelectedNetwork } from '../notional/use-notional';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';

export function useVaultAccount(vaultAddress?: string) {
  const { account } = useAccountDefinition();
  const vaultBalances =
    account?.balances.filter((t) => t.vaultAddress === vaultAddress) || [];

  return { vaultBalances, hasVaultPosition: vaultBalances.length > 0 };
}

export function useVaultProperties(vaultAddress?: string) {
  let minAccountBorrowSize: TokenBalance | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let strategyName = '';
  let vaultName: string | undefined = undefined;
  let minLeverageRatio = 0;
  let defaultLeverageRatio = 0;
  let maxLeverageRatio = 0;

  const network = useSelectedNetwork();

  if (vaultAddress && network) {
    try {
      const config = Registry.getConfigurationRegistry();
      ({ minAccountBorrowSize } = config.getVaultCapacity(
        network,
        vaultAddress
      ));

      const vaultConfig = config.getVaultConfig(network, vaultAddress);
      // TODO: move these to vault registry
      vaultName = vaultConfig.name;
      strategyName = 'SingleSidedLP';

      if (vaultConfig) {
        minDepositRequired = getMinDepositRequiredString(
          minAccountBorrowSize,
          vaultConfig.maxDeleverageCollateralRatioBasisPoints,
          vaultConfig.maxRequiredAccountCollateralRatioBasisPoints as number
        );

        minLeverageRatio = VaultAccountRiskProfile.collateralToLeverageRatio(
          (vaultConfig.maxRequiredAccountCollateralRatioBasisPoints as number) /
            RATE_PRECISION
        );
        defaultLeverageRatio =
          VaultAccountRiskProfile.collateralToLeverageRatio(
            vaultConfig.maxDeleverageCollateralRatioBasisPoints / RATE_PRECISION
          );
        maxLeverageRatio = VaultAccountRiskProfile.collateralToLeverageRatio(
          vaultConfig.minCollateralRatioBasisPoints / RATE_PRECISION
        );
      }
    } catch (e) {
      // Throws an error on an unknown vault address
      reportNotionalError(
        { ...(e as Error), code: 404 },
        'notionable-vaults',
        'useVault'
      );
    }
  }

  return {
    vaultName,
    minAccountBorrowSize,
    strategyName,
    defaultLeverageRatio,
    maxLeverageRatio,
    minLeverageRatio,
    minDepositRequired,
  };
}

export function getMinDepositRequiredString(
  minAccountBorrowSize: TokenBalance,
  maxDeleverageCollateralRatioBasisPoints: number,
  maxRequiredAccountCollateralRatioBasisPoints: number
) {
  const lowerDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxDeleverageCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);

  const upperDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxRequiredAccountCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);
  return `${lowerDeposit} to ${upperDeposit}`;
}
