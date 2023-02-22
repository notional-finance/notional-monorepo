import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

export function useManageVault() {
  const { pathname: currentPath } = useLocation();

  const manageVaultActions = {
    [VAULT_ACTIONS.DEPOSIT_COLLATERAL]: {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      link: `${currentPath}/${VAULT_ACTIONS.DEPOSIT_COLLATERAL}`,
    },
    [VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]: {
      label: <FormattedMessage defaultMessage={'Withdraw and Repay Debt'} />,
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT}`,
    },
    [VAULT_ACTIONS.WITHDRAW_VAULT]: {
      label: <FormattedMessage defaultMessage={'Withdraw / Exit Vault'} />,
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
    },
    [VAULT_ACTIONS.INCREASE_POSITION]: {
      label: <FormattedMessage defaultMessage={'Increase Position'} />,
      link: `${currentPath}/${VAULT_ACTIONS.INCREASE_POSITION}`,
    },
    [VAULT_ACTIONS.ROLL_POSITION]: {
      label: <FormattedMessage defaultMessage={'Roll Maturity'} />,
      link: `${currentPath}/${VAULT_ACTIONS.ROLL_POSITION}`,
    },
    [VAULT_ACTIONS.WITHDRAW_VAULT]: {
      label: <FormattedMessage defaultMessage={'Withdraw / Exit Vault'} />,
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
    },
    [VAULT_ACTIONS.ESTABLISH_ACCOUNT]: {
      label: <FormattedMessage defaultMessage={'Establish vault'} />,
      link: `${currentPath}/${VAULT_ACTIONS.ESTABLISH_ACCOUNT}`,
    },
    [VAULT_ACTIONS.CREATE_VAULT_POSITION]: {
      label: <FormattedMessage defaultMessage={'Create Vault Position'} />,
      link: `${currentPath}/${VAULT_ACTIONS.CREATE_VAULT_POSITION}`,
    },
    [VAULT_ACTIONS.DELEVERAGE_VAULT]: {
      label: <FormattedMessage defaultMessage={'DELEVERAGE_VAULT'} />,
      link: `${currentPath}/${VAULT_ACTIONS.DELEVERAGE_VAULT}`,
    },

    [VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: {
      label: (
        <FormattedMessage defaultMessage={'Withdraw Vault Post Maturity'} />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY}`,
    },
    [VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]: {
      label: <FormattedMessage defaultMessage={'DELEVERAGE_VAULT_DEPOSIT'} />,
      link: `${currentPath}/${VAULT_ACTIONS.DELEVERAGE_VAULT}`,
    },
  };

  return { manageVaultActions };
}
