import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { messages } from '../../messages';

export function useManageVault() {
  const { pathname: currentPath } = useLocation();

  const manageVaultActions = {
    [VAULT_ACTIONS.DEPOSIT_COLLATERAL]: {
      label: (
        <FormattedMessage
          {...messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL].heading}
        />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.DEPOSIT_COLLATERAL}`,
    },
    [VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]: {
      label: (
        <FormattedMessage
          {...messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT].heading}
        />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT}`,
    },
    [VAULT_ACTIONS.INCREASE_POSITION]: {
      label: (
        <FormattedMessage
          {...messages[VAULT_ACTIONS.INCREASE_POSITION].heading}
        />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.INCREASE_POSITION}`,
    },
    [VAULT_ACTIONS.WITHDRAW_VAULT]: {
      label: (
        <FormattedMessage {...messages[VAULT_ACTIONS.WITHDRAW_VAULT].heading} />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT}`,
    },
    [VAULT_ACTIONS.ROLL_POSITION]: {
      label: (
        <FormattedMessage {...messages[VAULT_ACTIONS.ROLL_POSITION].heading} />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.ROLL_POSITION}`,
    },
    [VAULT_ACTIONS.CREATE_VAULT_POSITION]: {
      label: (
        <FormattedMessage
          {...messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].heading}
        />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.CREATE_VAULT_POSITION}`,
    },
    [VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: {
      label: (
        <FormattedMessage
          {...messages[VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY].heading}
        />
      ),
      link: `${currentPath}/${VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY}`,
    },
  };

  return { manageVaultActions };
}
