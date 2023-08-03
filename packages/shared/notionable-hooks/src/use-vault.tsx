import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useNotionalError, useSelectedNetwork } from './use-notional';
import { FormattedMessage } from 'react-intl';

export function useVaultProperties(vaultAddress?: string) {
  let minAccountBorrowSize: TokenBalance | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let strategyName = '';
  let vaultName: string | undefined = undefined;

  const network = useSelectedNetwork();
  const { reportError } = useNotionalError();

  if (vaultAddress && network) {
    try {
      const config = Registry.getConfigurationRegistry();
      ({ minAccountBorrowSize } = config.getVaultCapacity(
        network,
        vaultAddress
      ));
      const vaultConfig = config.getVaultConfig(network, vaultAddress);
      // TODO: move these to vault registry
      vaultName = config.getVaultName(network, vaultAddress);
      strategyName = 'SingleSidedLP';

      if (vaultConfig) {
        minDepositRequired = getMinDepositRequiredString(
          minAccountBorrowSize,
          vaultConfig.maxDeleverageCollateralRatioBasisPoints,
          vaultConfig.maxRequiredAccountCollateralRatioBasisPoints as number
        );
      }
    } catch (e) {
      // Throws an error on an unknown vault address
      reportError({ ...(e as Error), code: 404, msg: 'Unknown Vault' });
    }
  }

  return {
    vaultName,
    minAccountBorrowSize,
    strategyName,
    minDepositRequired,
  };
}

export function useAllVaults() {
  const network = useSelectedNetwork();
  if (!network) return [];

  const config = Registry.getConfigurationRegistry();
  const listedVaults = config.getAllListedVaults(network)?.map((v) => {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
    } = config.getVaultCapacity(network, v.vaultAddress);
    const primaryToken = Registry.getTokenRegistry().getTokenByID(
      network,
      v.primaryBorrowCurrency.id
    );

    return {
      ...v,
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
      minDepositRequired: getMinDepositRequiredString(
        minAccountBorrowSize,
        v.maxDeleverageCollateralRatioBasisPoints,
        v.maxRequiredAccountCollateralRatioBasisPoints as number
      ),
      primaryToken,
    };
  });

  return listedVaults || [];
}

export function useManageVault(
  vaultAddress: string | undefined,
  hasVaultPosition: boolean
) {
  const network = useSelectedNetwork();

  let canRollMaturity = false;
  if (network && vaultAddress) {
    canRollMaturity = Registry.getConfigurationRegistry().getVaultConfig(
      network,
      vaultAddress
    ).allowRollPosition;
  }

  if (!hasVaultPosition || !vaultAddress) {
    return { reduceLeverageOptions: [], manageVaultOptions: [] };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${vaultAddress}/WithdrawVault`,
        key: 'WithdrawVault',
      },
      {
        label: <FormattedMessage defaultMessage={'Increase Vault Position'} />,
        link: `/vaults/${vaultAddress}/IncreaseVaultPosition`,
        key: 'IncreaseVaultPosition',
      },
    ];

    if (canRollMaturity)
      manageVaultOptions.push({
        label: <FormattedMessage defaultMessage={'Roll Vault Position'} />,
        link: `/vaults/${vaultAddress}/RollVaultPosition`,
        key: 'RollVaultPosition',
      });

    return {
      reduceLeverageOptions: [
        {
          label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
          link: `/vaults/${vaultAddress}/DepositVaultCollateral`,
          key: 'DepositCollateral',
        },
        {
          label: (
            <FormattedMessage defaultMessage={'Repay Debt with Vault Assets'} />
          ),
          link: `/vaults/${vaultAddress}/WithdrawAndRepayVault`,
          key: 'WithdrawAndRepayVault',
        },
      ],
      manageVaultOptions,
    };
  }
}

function getMinDepositRequiredString(
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
