import {
  PortfolioIcon,
  NoteOutlineIcon,
  BarChartIcon,
  CoinsIcon,
  GearIcon,
  LightningOutlineIcon,
  ExponentBetaIcon,
} from '@notional-finance/icons';
import { MOBILE_SUB_NAV_ACTIONS, Network } from '@notional-finance/util';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { INavLink } from './nav-link';
import { useParams } from 'react-router';
import { useWalletAddress } from '@notional-finance/notionable-hooks';

export const useNavLinks = (mobileNav: boolean, theme: NotionalTheme) => {
  const params = useParams();
  const selectedAddress = useWalletAddress();
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
      link: `/portfolio/${network}/overview`,
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
      key: 'vaults',
      label: <FormattedMessage defaultMessage={'Vaults'} />,
      link: '/vaults',
      iconImg: (
        <LightningOutlineIcon
          className="color-stroke"
          sx={{
            height: theme.spacing(2.25),
            fill: textColor,
            stroke: 'transparent',
          }}
        />
      ),
    },
    // {
    //   key: 'points',
    //   label: <FormattedMessage defaultMessage={'Points'} />,
    //   link: '/points',
    //   iconImg: (
    //     <PointsOutlineIcon
    //       className="color-fill"
    //       sx={{
    //         height: theme.spacing(2.25),
    //       }}
    //     />
    //   ),
    // },
    {
      key: 'exponent-beta',
      link: '/exponent-leaderboard',
      isRight: true,
      iconImg: <ExponentBetaIcon sx={{ width: 168, height: 33 }} />,
    },
    {
      key: 'note',
      label: <FormattedMessage defaultMessage={'NOTE'} />,
      link: '/note',
      isRight: true,
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
      link: selectedAddress
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
      key: MOBILE_SUB_NAV_ACTIONS.VAULTS,
      label: <FormattedMessage defaultMessage={'Vaults'} />,
      link: '/vaults',
      iconImg: (
        <BarChartIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem', stroke: '', fill: textColor }}
        />
      ),
    },
    {
      key: MOBILE_SUB_NAV_ACTIONS.POINTS,
      label: <FormattedMessage defaultMessage={'Points'} />,
      link: '/points',
      iconImg: (
        <CoinsIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem', fill: 'transparent', stroke: textColor }}
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
          fill={theme.palette.typography.main}
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
