import { useState } from 'react';
import { Toolbar, Box, useTheme, ThemeProvider, styled } from '@mui/material';
import { AppBar, AppBarProps, H4 } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import MobileNavigation from './mobile-navigation/mobile-navigation';
import { useLocation } from 'react-router';
// import blitz from '@notional-finance/mui/src/assets/icons/blitz.svg';
import {
  useNotionalContext,
  // showContestNavLink,
} from '@notional-finance/notionable-hooks';
import AnalyticsDropdown from './analytics-dropdown/analytics-dropdown';
import ScrollIndicator from './scroll-indicator/scroll-indicator';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

/* eslint-disable-next-line */
export interface HeaderProps extends AppBarProps {}

export function Header({ children }: HeaderProps) {
  const [isTop, setIsTop] = useState(true);
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const contestTheme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme =
    pathname === '/'
      ? landingTheme
      : pathname.includes('contest')
      ? contestTheme
      : appTheme;
  const { navLinks } = useNavLinks(false, theme);
  const {
    globalState: { hasSelectedChainError },
  } = useNotionalContext();

  // NOTE: Leaving this here for when we want to have another contest
  // const handleContestClick = () => {
  //   history.push('/contest');
  // };

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
          <WalletContainer>
            {/* 
            NOTE: Leaving this here for when we want to have another contest
            {showContestNavLink && pathname !== '/' && (
              <Box
                sx={{
                  marginRight: '40px',
                  marginTop: '15px',
                  cursor: 'pointer',
                }}
                onClick={handleContestClick}
              >
                <img
                  src={blitz}
                  alt="blitz badge"
                  style={{ width: '76px', height: '46px' }}
                />
                <Box
                  sx={{
                    height: '5px',
                    marginTop: '3px',
                    background: pathname.includes('contest')
                      ? colors.neonTurquoise
                      : 'transparent',
                    width: '100%',
                  }}
                ></Box>
              </Box>
            )} */}
            {children}
          </WalletContainer>
        </Toolbar>
        {hasSelectedChainError && (
          <Box
            sx={{
              minWidth: '100%',
              minHeight: theme.spacing(5),
              background: colors.orange,
              display: 'flex',
              alignItems: 'center',
              color: colors.black,
            }}
          >
            <Box sx={{ paddingLeft: theme.spacing(3) }}>
              <FormattedMessage
                defaultMessage={
                  'Please switch your wallet to the Arbitrum network.'
                }
              />
            </Box>
          </Box>
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
