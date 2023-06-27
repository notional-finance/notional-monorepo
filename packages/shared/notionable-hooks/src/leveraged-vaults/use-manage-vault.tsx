import { FormattedMessage } from 'react-intl';
import { useVaultAccount } from './use-vault';

export function useManageVault(vaultAddress?: string) {
  const { hasVaultPosition, canRollMaturity } = useVaultAccount(vaultAddress);

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
          link: `/vaults/${vaultAddress}/DepositCollateral`,
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
