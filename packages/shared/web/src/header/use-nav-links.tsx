import {
  ActiveBellIcon,
  BellIcon,
  PortfolioIcon,
  StackIcon,
  DocsIcon,
  NotionalPlainIcon,
  ResourcesIcon,
  BarChartIcon,
  GearIcon,
} from '@notional-finance/icons';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/util';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { INavLink } from './nav-link';

export const useNavLinks = (mobileNav: boolean, theme: NotionalTheme) => {
  const notifications = getFromLocalStorage('notifications');

  const textColor = mobileNav
    ? theme.palette.common.black
    : theme.palette.common.white;

  const navLinks: INavLink[] = [
    {
      key: 'portfolio',
      label: <FormattedMessage defaultMessage={'Portfolio'} />,
      link: '/portfolio/overview',
      iconImg: (
        <PortfolioIcon
          className="color-fill"
          sx={{
            height: theme.spacing(2.25),
            fill: textColor,
            stroke: 'transparent',
          }}
        />
      ),
    },
    {
      key: 'markets',
      label: <FormattedMessage defaultMessage={'Markets'} />,
      link: '/markets',
      iconImg: (
        <StackIcon
          className="color-fill"
          sx={{
            height: theme.spacing(2.25),
            fill: textColor,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  const mobileSubNavLinks: INavLink[] = [
    {
      key: MOBILE_SUB_NAV_ACTIONS.EARN_YIELD,
      label: <FormattedMessage defaultMessage={'Earn Yield'} />,
      link: '',
      iconImg: (
        <BarChartIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem', stroke: '', fill: textColor }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.RESOURCES,
      label: <FormattedMessage defaultMessage={'Resources'} />,
      link: '/resources',
      iconImg: (
        <DocsIcon
          sx={{ color: theme.palette.common.black, fontSize: '24px' }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.SECURITY,
      label: <FormattedMessage defaultMessage={'Security'} />,
      link: '/security',
      iconImg: (
        <ResourcesIcon
          sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.COMPANY,
      label: <FormattedMessage defaultMessage={'Company'} />,
      link: '/company',
      iconImg: (
        <NotionalPlainIcon
          sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.SETTINGS,
      label: <FormattedMessage defaultMessage={'Settings'} />,
      link: '',
      iconImg: <GearIcon sx={{ fontSize: '24px' }} />,
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.NOTIFICATIONS,
      label: <FormattedMessage defaultMessage={'Notifications'} />,
      link: '',
      noBottomBorder: true,
      iconImg: notifications.active ? (
        <ActiveBellIcon
          className="color-stroke"
          sx={{ fontSize: '24px', stroke: '', fill: textColor }}
        />
      ) : (
        <BellIcon
          className="color-stroke"
          sx={{ fontSize: '24px', stroke: '', fill: textColor }}
        />
      ),
    },
  ];

  return {
    navLinks,
    mobileSubNavLinks,
  };
};
