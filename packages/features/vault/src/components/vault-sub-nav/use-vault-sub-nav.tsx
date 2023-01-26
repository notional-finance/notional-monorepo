import { animateScroll as scroll } from 'react-scroll';
import { FormattedMessage } from 'react-intl';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';

export const useVaultSubNav = () => {
  const subNavData = [
    {
      label: <FormattedMessage defaultMessage={'Overview'} />,
      key: VAULT_SUB_NAV_ACTIONS.OVERVIEW,
      anchor: VAULT_SUB_NAV_ACTIONS.OVERVIEW,
    },
    {
      label: <FormattedMessage defaultMessage={'Market Returns'} />,
      key: VAULT_SUB_NAV_ACTIONS.MARKET_RETURNS,
      anchor: VAULT_SUB_NAV_ACTIONS.MARKET_RETURNS,
    },
    // {
    //   label: 'Yield Drivers',
    //   key: VAULT_SUB_NAV_ACTIONS.YIELD_DRIVERS,
    //   anchor: VAULT_SUB_NAV_ACTIONS.YIELD_DRIVERS,
    // },
    {
      label: <FormattedMessage defaultMessage={'Strategy Details'} />,
      key: VAULT_SUB_NAV_ACTIONS.STRATEGY_DETAILS,
      anchor: VAULT_SUB_NAV_ACTIONS.STRATEGY_DETAILS,
    },
    {
      label: <FormattedMessage defaultMessage={'Back to top'} />,
      key: VAULT_SUB_NAV_ACTIONS.BACK_TO_TOP,
      callback: () => scroll.scrollToTop(),
    },
    {
      label: <FormattedMessage defaultMessage={'Full Documentation'} />,
      key: VAULT_SUB_NAV_ACTIONS.FULL_DOCUMENTATION,
      href: 'https://docs.notional.finance/leveraged-vaults/leveraged-vaults/balancer-aura-wsteth-weth-strategy',
    },
  ];
  return subNavData;
};
