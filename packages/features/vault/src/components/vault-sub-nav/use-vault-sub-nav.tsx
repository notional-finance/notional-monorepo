import { animateScroll as scroll } from 'react-scroll';
import { FormattedMessage } from 'react-intl';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/util';

export const useVaultSubNav = () => {
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
      // TODO: we need to have a registry for this
      href: 'https://docs.notional.finance/leveraged-vaults/leveraged-vaults/balancer-aura-wsteth-weth-strategy',
    },
  ];
  return subNavData;
};
