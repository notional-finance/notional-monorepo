import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';

export function useManageVault() {
  const reduceLeverageOptions = [
    {
      label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
      href: '',
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw and Repay Debt'} />,
      href: '',
    },
  ];

  const manageVaultOptions = [
    {
      label: <FormattedMessage defaultMessage={'Increase Position'} />,
      href: '',
    },
    {
      label: <FormattedMessage defaultMessage={'Roll Maturity'} />,
      href: '',
    },
    {
      label: <FormattedMessage defaultMessage={'Withdraw / Exit Vault'} />,
      href: '',
    },
  ];

  return { reduceLeverageOptions, manageVaultOptions };
}
