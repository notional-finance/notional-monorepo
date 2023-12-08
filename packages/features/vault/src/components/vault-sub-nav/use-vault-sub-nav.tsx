import { animateScroll as scroll } from 'react-scroll';
import { FormattedMessage } from 'react-intl';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/util';
import { useVaultStrategyData } from '../../hooks';

export const useVaultSubNav = () => {
  const data = useVaultStrategyData();
  const subNavData = [
    {
      label: <FormattedMessage defaultMessage={'Overview'} />,
      key: VAULT_SUB_NAV_ACTIONS.OVERVIEW,
      anchor: VAULT_SUB_NAV_ACTIONS.OVERVIEW,
    },
    {
      label: <FormattedMessage defaultMessage={'Return Drivers'} />,
      key: VAULT_SUB_NAV_ACTIONS.RETURN_DRIVERS,
      anchor: VAULT_SUB_NAV_ACTIONS.RETURN_DRIVERS,
    },
    {
      label: <FormattedMessage defaultMessage={'FAQs'} />,
      key: VAULT_SUB_NAV_ACTIONS.FAQ,
      anchor: VAULT_SUB_NAV_ACTIONS.FAQ,
    },
    {
      label: <FormattedMessage defaultMessage={'Back to top'} />,
      key: VAULT_SUB_NAV_ACTIONS.BACK_TO_TOP,
      anchor: VAULT_SUB_NAV_ACTIONS.OVERVIEW,
      callback: () => scroll.scrollToTop(),
    },
    {
      label: <FormattedMessage defaultMessage={'Docs'} />,
      key: VAULT_SUB_NAV_ACTIONS.FULL_DOCUMENTATION,
      href: data?.docsLink,
    },
  ];
  return subNavData;
};
