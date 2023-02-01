import {
  PORTFOLIO_CATEGORIES,
  VAULT_ACTIONS,
} from '@notional-finance/shared-config';
import { useQueryParams } from '@notional-finance/utils';
import { FormattedMessage } from 'react-intl';

export function useManageVault() {
  const { vaultAddress } = useQueryParams();

  const reduceLeverageOptions = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.DEPOSIT_COLLATERAL}`,
      key: VAULT_ACTIONS.DEPOSIT_COLLATERAL,
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw and Repay Debt'} />,
      link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
      key: VAULT_ACTIONS.WITHDRAW_VAULT,
    },
  ];

  const manageVaultOptions = [
    {
      label: <FormattedMessage defaultMessage={'Increase Position'} />,
      link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.INCREASE_POSITION}`,
      key: VAULT_ACTIONS.INCREASE_POSITION,
    },
    {
      label: <FormattedMessage defaultMessage={'Roll Maturity'} />,
      link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.ROLL_POSITION}`,
      key: VAULT_ACTIONS.ROLL_POSITION,
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw / Exit Vault'} />,
      link: `/vaults/${vaultAddress}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
      key: VAULT_ACTIONS.WITHDRAW_VAULT,
    },
  ];

  return { reduceLeverageOptions, manageVaultOptions };
}
