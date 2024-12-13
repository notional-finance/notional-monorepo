import {
  PortfolioIcon,
  NoteOutlineIcon,
  BarChartIcon,
  CoinsIcon,
  GearIcon,
  LightningOutlineIcon,
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
  const params = useParams();
  const [{ wallet }] = useConnectWallet();
  const network =
    params && 'selectedNetwork' in params
      ? params['selectedNetwork']
      : Network.mainnet;

  const textColor = mobileNav
    ? theme.palette.common.black
    : theme.palette.common.white;

  const navLinks: INavLink[] = [
    {
      key: 'portfolio',
      label: <FormattedMessage defaultMessage={'Portfolio'} />,
      link: wallet?.accounts[0].address
        ? `/portfolio/${network}/overview`
        : `/portfolio/${network}/welcome/earn`,
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
          sx={{
            height: theme.spacing(2.5),
          }}
        />
      ),
    },
  ];

  const mobileNavLinks: INavLink[] = [
    {
      key: 'portfolio',
      label: <FormattedMessage defaultMessage={'Portfolio'} />,
      link: wallet?.accounts[0].address
        ? `/portfolio/${network}/overview`
        : `/portfolio/${network}/welcome/earn`,
      iconImg: (
        <PortfolioIcon
          className="color-fill"
          sx={{
            fontSize: '1.125rem',
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
      label: <FormattedMessage defaultMessage={'Earn'} />,
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
      key: MOBILE_SUB_NAV_ACTIONS.LEVERAGE,
      label: <FormattedMessage defaultMessage={'Leverage'} />,
      link: '',
      iconImg: (
        <LightningOutlineIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem' }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.SETTINGS,
      label: <FormattedMessage defaultMessage={'Wallet Settings'} />,
      link: '',
      iconImg: (
        <GearIcon
          sx={{ fontSize: '1.125rem' }}
          stroke={theme.palette.typography.main}
        />
      ),
    },
  ];

  return {
    navLinks,
    mobileNavLinks,
    mobileSubNavLinks,
  };
};
