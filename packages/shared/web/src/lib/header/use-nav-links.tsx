import {
  BarChartIcon,
  CoinsIcon,
  PortfolioIcon,
  DocsIcon,
  NotionalPlainIcon,
  ResourcesIcon,
} from '@notional-finance/icons';
import { NotionalPageLayoutOptions, NotionalTheme } from '@notional-finance/styles';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { INavLink } from './nav-link';

export const useNavLinks = (mobileNav: boolean, theme: NotionalTheme) => {
  const [_, setPageLayout] = useState<NotionalPageLayoutOptions>('app');

  const textColor = mobileNav ? theme.palette.common.black : theme.palette.common.white;

  const navLinks: INavLink[] = [
    {
      key: 'portfolio',
      label: <FormattedMessage defaultMessage={'Portfolio'} />,
      link: '/portfolio/overview',
      iconImg: (
        <PortfolioIcon
          className="color-fill"
          sx={{ fontSize: '1.125rem', fill: textColor, stroke: 'transparent' }}
        />
      ),
    },
    {
      key: 'lend',
      label: <FormattedMessage defaultMessage={'Lend Fixed'} />,
      link: '/lend',
      iconImg: (
        <BarChartIcon
          className="color-fill"
          sx={{ fontSize: '1.125rem', fill: textColor, stroke: 'transparent' }}
        />
      ),
    },
    {
      key: 'borrow',
      label: <FormattedMessage defaultMessage={'Borrow Fixed'} />,
      link: '/borrow',
      iconImg: (
        <CoinsIcon
          className="color-stroke"
          sx={{ fontSize: '1.125rem', stroke: textColor, fill: 'transparent' }}
        />
      ),
    },
  ];

  const mobileSubNavLinks: INavLink[] = [
    {
      key: 'resources',
      label: <FormattedMessage defaultMessage={'Resources'} />,
      link: '/resources',
      iconImg: <DocsIcon sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }} />,
    },
    {
      key: 'security',
      label: <FormattedMessage defaultMessage={'Security'} />,
      link: '/security',
      iconImg: <ResourcesIcon sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }} />,
    },
    {
      key: 'company',
      label: <FormattedMessage defaultMessage={'Company'} />,
      link: '/company',
      noBottomBorder: true,
      iconImg: (
        <NotionalPlainIcon sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }} />
      ),
    },
  ];

  return {
    setPageLayout,
    navLinks,
    mobileSubNavLinks,
  };
};
