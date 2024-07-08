import {
  PortfolioIcon,
  // StackIcon,
  NoteOutlineIcon,
  DocsIcon,
  NotionalPlainIcon,
  ResourcesIcon,
  BarChartIcon,
  CoinsIcon,
  GearIcon,
} from '@notional-finance/icons';
import { MOBILE_SUB_NAV_ACTIONS, Network } from '@notional-finance/util';
import { useConnectWallet } from '@web3-onboard/react';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { INavLink } from './nav-link';
import EarnDropdown from './earn-dropdown/earn-dropdown';
import BorrowDropDown from './borrow-dropdown/borrow-dropdown';
import LeverageDropdown from './leverage-dropdown/leverage-dropdown';
import { useParams } from 'react-router';

export const useNavLinks = (mobileNav: boolean, theme: NotionalTheme) => {
  const params = useParams<any>();
  const [{ wallet }] = useConnectWallet();
  const network = params?.selectedNetwork || Network.mainnet;

  const textColor = mobileNav
    ? theme.palette.common.black
    : theme.palette.common.white;

  const navLinks: INavLink[] = [
    {
      key: 'portfolio',
      label: <FormattedMessage defaultMessage={'Portfolio'} />,
      link: wallet?.accounts[0].address
        ? `/portfolio/${network}/overview`
        : `/portfolio/${network}/welcome`,
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
      key: 'earn',
      CustomComponent: EarnDropdown,
    },
    {
      key: 'leverage',
      CustomComponent: LeverageDropdown,
    },
    {
      key: 'borrow',
      CustomComponent: BorrowDropDown,
    },
    // {
    //   key: 'markets',
    //   label: <FormattedMessage defaultMessage={'Markets'} />,
    //   link: '/markets',
    //   iconImg: (
    //     <StackIcon
    //       className="color-fill"
    //       sx={{
    //         height: theme.spacing(2.25),
    //         fill: textColor,
    //         stroke: 'transparent',
    //       }}
    //     />
    //   ),
    // },
    {
      key: 'note',
      label: <FormattedMessage defaultMessage={'NOTE'} />,
      link: '/note',
      iconImg: (
        <NoteOutlineIcon
          fill={theme.palette.typography.main}
          className="color-fill"
          sx={{
            height: theme.spacing(2.5),
          }}
        />
      ),
    },
  ];

  const mobileNavLinks = navLinks.filter(
    (navLink) =>
      navLink.key !== 'earn' &&
      navLink.key !== 'borrow' &&
      navLink.key !== 'leverage'
  );

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
      key: MOBILE_SUB_NAV_ACTIONS.BORROW,
      label: <FormattedMessage defaultMessage={'Borrow'} />,
      link: '',
      iconImg: (
        <CoinsIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem', fill: 'transparent', stroke: textColor }}
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
  ];

  return {
    navLinks,
    mobileNavLinks,
    mobileSubNavLinks,
  };
};
