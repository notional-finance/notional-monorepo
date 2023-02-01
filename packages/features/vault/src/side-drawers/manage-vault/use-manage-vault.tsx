import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

export function useManageVault() {
  const { pathname: currentPath } = useLocation();
  const reduceLeverageOptions = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      link: `${currentPath}/${VAULT_ACTIONS.DEPOSIT_COLLATERAL}`,
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw and Repay Debt'} />,
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT}`,
    },
  ];

  const manageVaultOptions = [
    {
      label: <FormattedMessage defaultMessage={'Increase Position'} />,
      link: `${currentPath}/${VAULT_ACTIONS.INCREASE_POSITION}`,
    },
    {
      label: <FormattedMessage defaultMessage={'Roll Maturity'} />,
      link: `${currentPath}/${VAULT_ACTIONS.ROLL_POSITION}`,
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw / Exit Vault'} />,
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
    },
  ];

  return { reduceLeverageOptions, manageVaultOptions };
}
