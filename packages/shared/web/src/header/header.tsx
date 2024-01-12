import { useState } from 'react';
import { Toolbar, Box, useTheme, ThemeProvider } from '@mui/material';
import { AppBar, AppBarProps, H4 } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import MobileNavigation from './mobile-navigation/mobile-navigation';
import { useLocation } from 'react-router-dom';
import ResourcesDropdown from './resources/resources-dropdown/resources-dropdown';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import AnalyticsDropdown from './analytics-dropdown/analytics-dropdown';
import ScrollIndicator from './scroll-indicator/scroll-indicator';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

/* eslint-disable-next-line */
export interface HeaderProps extends AppBarProps {}

export function Header({ children }: HeaderProps) {
  const [isTop, setIsTop] = useState(true);
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme = pathname === '/' ? landingTheme : appTheme;
  const { navLinks } = useNavLinks(false, theme);
  const {
    globalState: { hasSelectedChainError },
  } = useNotionalContext();

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

export default Header;
