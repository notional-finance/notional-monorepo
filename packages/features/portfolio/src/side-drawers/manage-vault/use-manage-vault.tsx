import { useVaultAccount } from '@notional-finance/notionable-hooks';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useQueryParams } from '@notional-finance/utils';
import { FormattedMessage } from 'react-intl';

export function useManageVault() {
  const { vaultAddress } = useQueryParams();
  const { vaultAccount, canRollMaturity } = useVaultAccount(vaultAddress);

  if (!vaultAccount) {
    return { reduceLeverageOptions: [], manageVaultOptions: [] };
  } else if (vaultAccount.canSettle()) {
    return {
      reduceLeverageOptions: [],
      manageVaultOptions: [
        {
          label: <FormattedMessage defaultMessage={'Create Vault Position'} />,
          link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.CREATE_VAULT_POSITION}`,
          key: VAULT_ACTIONS.CREATE_VAULT_POSITION,
        },
        {
          label: (
            <FormattedMessage defaultMessage={'Withdraw Matured Position'} />
          ),
          link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY}`,
          key: VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
        },
      ],
    };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
        key: VAULT_ACTIONS.WITHDRAW_VAULT,
      },
      {
        label: <FormattedMessage defaultMessage={'Increase Vault Position'} />,
        link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.INCREASE_POSITION}`,
        key: VAULT_ACTIONS.INCREASE_POSITION,
      },
    ];
    if (canRollMaturity)
      manageVaultOptions.push({
        label: <FormattedMessage defaultMessage={'Roll Vault Position'} />,
        link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.ROLL_POSITION}`,
        key: VAULT_ACTIONS.ROLL_POSITION,
      });

    return {
      reduceLeverageOptions: [
        {
          label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
          link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.DEPOSIT_COLLATERAL}`,
          key: VAULT_ACTIONS.DEPOSIT_COLLATERAL,
        },
        {
          label: (
            <FormattedMessage defaultMessage={'Repay Debt with Vault Assets'} />
          ),
          link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT}`,
          key: VAULT_ACTIONS.WITHDRAW_VAULT,
        },
      ],
      manageVaultOptions,
    };
  }
}
