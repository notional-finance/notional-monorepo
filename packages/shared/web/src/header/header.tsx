import { useEffect, useState } from 'react';
import { Toolbar, Box, useTheme, ThemeProvider, styled } from '@mui/material';
import { AppBar, AppBarProps, Body, H4 } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import {
  THEME_VARIANTS,
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import { MobileNavigation } from './mobile-navigation/mobile-navigation';
import { useLocation } from 'react-router-dom';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
  useAppStore,
  useSelectedNetwork,
  useWalletNetworkAccounts,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import AnalyticsDropdown from './analytics-dropdown/analytics-dropdown';
import ScrollIndicator from './scroll-indicator/scroll-indicator';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { AlertIcon } from '@notional-finance/icons';
import { update } from '@intercom/messenger-js-sdk';

/* eslint-disable-next-line */
export interface HeaderProps extends AppBarProps {}

export function Header({ children }: HeaderProps) {
  const [isTop, setIsTop] = useState(true);
  const selectedNetwork = useSelectedNetwork();
  const [hideError, setHideError] = useState(false);
  const { setIsMobileView, isMobileView } = useAppStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const hideSubGraphError = getFromLocalStorage('hideSubGraphError');
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const contestTheme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const { isStarterBoostUser } = useWalletStore();
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme =
    pathname === '/' || pathname === '/note'
      ? landingTheme
      : pathname.includes('contest') || pathname.includes('points-dashboard')
      ? contestTheme
      : appTheme;
  const { navLinks } = useNavLinks(false, theme);
  const networkAccounts = useWalletNetworkAccounts();

  const subGraphError =
    networkAccounts &&
    selectedNetwork &&
    networkAccounts[selectedNetwork]?.isSubgraphDown &&
    !hideError &&
    hideSubGraphError !== true
      ? true
      : false;

  const handleErrorMessage = () => {
    setHideError(true);
    setInLocalStorage('hideSubGraphError', true);
  };

  useEffect(() => {
    if (window.innerWidth <= 768 && !isMobileView) {
      setIsMobileView(true);
      update({ hideDefaultLauncher: true });
    } else if (window.innerWidth > 768 && isMobileView) {
      setIsMobileView(false);
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileView, isMobileView]);

  useEffect(() => {
    if (pathname === '/') {
      const handleScroll = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 0) {
          setIsTop(false);
        } else {
          setIsTop(true);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsTop(false);
      return undefined;
    }
  }, [pathname]);

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="fixed"
        showBorder={pathname !== '/'}
        showBanner={isStarterBoostUser && pathname.includes('portfolio')}
      >
        <Toolbar
          sx={{
            '&.MuiToolbar-root': {
              minHeight: '100%',
              maxWidth: { xs: '100vw', sm: '100vw', md: '100%' },
              transition: 'background 0.3s ease-in-out',
              background:
                isMobile && pathname !== '/'
                  ? theme.palette.background.paper
                  : isTop
                  ? 'transparent'
                  : theme.palette.background.default,
              padding: isMobile ? '0px' : '',
            },
          }}
        >
          {!isMobile && (
            <H4 to="/">
              <NotionalLogo />
            </H4>
          )}
          <NavContainer>
            <Navigation navLinks={navLinks} />
          </NavContainer>
          <AnalyticsContainer>
            {pathname === '/' && <AnalyticsDropdown />}
          </AnalyticsContainer>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none', lg: 'none' },
              flexDirection: 'row-reverse',
            }}
          >
            <MobileNavigation />
          </Box>
          <WalletContainer>{children}</WalletContainer>
        </Toolbar>
        {subGraphError && (
          <ErrorContainer>
            <Box
              sx={{
                width: '100%',
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <AlertIcon
                sx={{ fill: colors.black }}
                innerFill={colors.orange}
              />
              <Body sx={{ color: colors.black, padding: theme.spacing(2) }}>
                <FormattedMessage
                  defaultMessage={
                    'Trouble connecting to Notional subgraph, historical data, transaction history and earnings calculations may not load. Transactions will continue to function properly.'
                  }
                />
              </Body>
              <HighlightOffIcon
                onClick={handleErrorMessage}
                sx={{
                  fill: colors.black,
                  fontSize: theme.spacing(3.6),
                  cursor: 'pointer',
                }}
              />
            </Box>
          </ErrorContainer>
        )}
        {pathname === '/' && <ScrollIndicator />}
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

const ErrorContainer = styled(Box)(
  ({ theme }) => `
    width: ${theme.spacing(85)};
    margin: auto;
    background: ${colors.orange};
    border-radius: ${theme.shape.borderRadius()};
    display: flex;
    align-items: center;
    color: ${colors.black};
    margin-top: ${theme.spacing(2)};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      text-align: center;
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

export default Header;
