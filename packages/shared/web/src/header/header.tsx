import { Toolbar, Box, useTheme, ThemeProvider } from '@mui/material';
import { AppBar, AppBarProps, H4 } from '@notional-finance/mui';
import { NotionalLogo } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { useNotionalTheme } from '@notional-finance/styles';
import Navigation from './navigation/navigation';
import { useNavLinks } from './use-nav-links';
import MobileNavigation from './mobile-navigation/mobile-navigation';
import { ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import ResourcesDropdown from './resources/resources-dropdown/resources-dropdown';
import AboutDropdown from './about/about-dropdown/about-dropdown';

/* eslint-disable-next-line */
export interface HeaderProps extends AppBarProps {
  rightButton?: ReactElement;
}

export function Header({ rightButton }: HeaderProps) {
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  const appTheme = useTheme();
  const { pathname } = useLocation();
  const theme = pathname === '/' ? landingTheme : appTheme;
  const { navLinks } = useNavLinks(false, theme);

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" elevation={0}>
        <Toolbar
          sx={{
            '&.MuiToolbar-root': {
              minHeight: '100%',
              maxWidth: { xs: '100vw', sm: '100vw', md: '100%' },
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
                <AboutDropdown />
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
            {rightButton}
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default Header;
