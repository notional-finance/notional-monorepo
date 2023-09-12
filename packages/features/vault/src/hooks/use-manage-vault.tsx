import { FormattedMessage } from 'react-intl';

export function useManageVault(
  vaultAddress: string | undefined,
  hasVaultPosition: boolean
) {
  if (!hasVaultPosition || !vaultAddress) {
    return {
      reduceLeverageOptions: [],
      manageVaultOptions: [],
      rollMaturityOptions: [],
    };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Increase Vault Position'} />,
        link: `/vaults/${vaultAddress}/IncreaseVaultPosition`,
        key: 'IncreaseVaultPosition',
      },
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${vaultAddress}/WithdrawVault`,
        key: 'WithdrawVault',
      },
    ];

    const rollMaturityOptions = [
      {
        label: <FormattedMessage defaultMessage={'Roll Vault Position'} />,
        link: `/vaults/${vaultAddress}/RollVaultPosition`,
        key: 'RollVaultPosition',
        totalAPY: '12.54% APY'
      },
    ];

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
      rollMaturityOptions,
    };
  }
}
