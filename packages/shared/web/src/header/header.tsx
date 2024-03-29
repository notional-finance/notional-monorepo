import { useState } from 'react';
import { Toolbar, Box, useTheme, ThemeProvider } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AppBar, AppBarProps, H4, ExternalLink } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import MobileNavigation from './mobile-navigation/mobile-navigation';
import { useLocation } from 'react-router-dom';
import ResourcesDropdown from './resources/resources-dropdown/resources-dropdown';
import AnalyticsDropdown from './analytics-dropdown/analytics-dropdown';
import ScrollIndicator from './scroll-indicator/scroll-indicator';
import { ArrowRightIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';

/* eslint-disable-next-line */
export interface HeaderProps extends AppBarProps {}

export function Header({ children }: HeaderProps) {
  const [isTop, setIsTop] = useState(true);
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme = pathname === '/' ? landingTheme : appTheme;
  const { navLinks } = useNavLinks(false, theme);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 0) {
      setIsTop(false);
    } else {
      setIsTop(true);
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" elevation={0} showBorder={pathname !== '/'}>
        <Toolbar
          sx={{
            '&.MuiToolbar-root': {
              minHeight: '100%',
              maxWidth: { xs: '100vw', sm: '100vw', md: '100%' },
              transition: 'background 0.3s ease-in-out',
              background: isTop
                ? 'transparent'
                : theme.palette.background.default,
            },
          }}
        >
          <H4 to="/">
            <NotionalLogo />
          </H4>
          <Box
            sx={{
              marginLeft: '60px',
              flexGrow: 1,
              height: '100%',
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >
            <Navigation navLinks={navLinks} />
          </Box>
          <Box
            sx={{
              flexGrow: 0,
              height: '72px',
              display: {
                xs: 'none',
                lg: 'flex',
              },
              alignItems: 'center',
            }}
          >
            {pathname === '/' && (
              <>
                <AnalyticsDropdown />
                <ResourcesDropdown />
              </>
            )}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none', lg: 'none' },
              flexDirection: 'row-reverse',
            }}
          >
            <MobileNavigation />
          </Box>
          <Box
            sx={{
              flexGrow: 0,
              display: {
                xs: 'none',
                md: 'flex',
                lg: 'flex',
              },
            }}
          >
            {children}
          </Box>
        </Toolbar>
        <Box
          sx={{
            minWidth: '100%',
            minHeight: theme.spacing(6),
            background: colors.neonTurquoise,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: colors.black,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: theme.spacing(3),
            }}
          >
            <H4 sx={{ color: colors.black, fontWeight: 500 }}>
              <FormattedMessage
                defaultMessage={
                  'Notional V2 is being deprecated. Notional V3 is now live! <a1>Learn more</a1>'
                }
                values={{
                  a1: (msg: any) => (
                    <ExternalLink
                      textDecoration
                      href="https://blog.notional.finance/notional-v2-deprecation-plan/"
                      style={{ fontWeight: 600 }}
                    >
                      {msg}
                    </ExternalLink>
                  ),
                }}
              />
            </H4>
            <ArrowRightIcon fill={colors.black} sx={{ height: '12px' }} />
          </Box>
        </Box>
        {pathname === '/' && <ScrollIndicator />}
      </AppBar>
    </ThemeProvider>
  );
}

export default Header;
