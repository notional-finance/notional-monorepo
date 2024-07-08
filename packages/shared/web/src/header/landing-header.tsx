import { useState } from 'react';
import { Toolbar, Box, useTheme, ThemeProvider, styled } from '@mui/material';
import { AppBar, AppBarProps, H4 } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import { useLocation } from 'react-router';
import AnalyticsDropdown from './analytics-dropdown/analytics-dropdown';
import ScrollIndicator from './scroll-indicator/scroll-indicator';

/* eslint-disable-next-line */
export interface LandingHeaderProps extends AppBarProps {}

export function LandingHeader({ children }: LandingHeaderProps) {
  const [isTop, setIsTop] = useState(true);
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const contestTheme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme =
    pathname === '/' || pathname === '/note'
      ? landingTheme
      : pathname.includes('contest') || pathname.includes('points-dashboard')
      ? contestTheme
      : appTheme;
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
      <AppBar position="fixed" showBorder={pathname !== '/'}>
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
          <NavContainer>
            <Navigation navLinks={navLinks} />
          </NavContainer>
          <AnalyticsContainer>
            <AnalyticsDropdown />
          </AnalyticsContainer>
          <WalletContainer>{children}</WalletContainer>
        </Toolbar>
        <ScrollIndicator />
      </AppBar>
    </ThemeProvider>
  );
}

const NavContainer = styled(Box)(
  ({ theme }) => `
    margin-left: ${theme.spacing(7.5)};
    flex-grow: 1;
    height: 100%;
    display: flex;
    ${theme.breakpoints.down('sm')} {
        display: none;
    }
      `
);

const WalletContainer = styled(Box)(
  ({ theme }) => `
    flex-grow: 0;
    display: flex;
    align-items: center;
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
      `
);

const AnalyticsContainer = styled(Box)(
  ({ theme }) => `
    flex-grow: 0;
    height: ${theme.spacing(9)};
    display: flex;
    align-Items: center;
    margin-right: ${theme.spacing(3)};
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
      `
);

export default LandingHeader;
