import { CloseX } from '@notional-finance/icons';
import {
  Tab,
  Tabs,
  TabsProps,
  IconButton,
  Drawer,
  Box,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SyntheticEvent } from 'react';
import { MouseEvent } from 'react';
import MobileSubNav from './mobile-sub-nav/mobile-sub-nav';
import MobileSideDrawer from './mobile-side-drawer/mobile-side-drawer';
import {
  MOBILE_SUB_NAV_ACTIONS,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useNavLinks } from '../use-nav-links';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export function MobileNavigation({ ...rest }: TabsProps) {
  const theme = useTheme();
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { wallet } = useAppStore();
  const { setWalletSideDrawer } = useSideDrawerManager();

  const { mobileNavLinks } = useNavLinks(true, theme);
  const [selectedTab, setSelectedTab] = useState<string | false>(false);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const currentTab =
    mobileNavLinks.find(({ link }) => link === pathname)?.link || false;

  useEffect(() => {
    setSelectedTab(currentTab);
    setAnchorElNav(null);
  }, [currentTab]);

  const [sideDrawerDataKey, setSideDrawerDataKey] =
    useState<MOBILE_SUB_NAV_ACTIONS>(MOBILE_SUB_NAV_ACTIONS.EARN_YIELD);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    event.preventDefault();
    const item = mobileNavLinks.find((t) => t.link === newValue);
    if (item && item.external) {
      window.open(newValue, item.target);
    } else {
      navigate(newValue);
    }
  };

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorElNav(null);
  };

  const handleSideDrawer = (event: any) => {
    event.preventDefault();
    const dataKey = event.target.getAttribute('data-key');
    setSideDrawerDataKey(dataKey);
    setDrawerOpen(true);
  };

  return window.innerWidth <= theme.breakpoints.values.sm ? (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        {!wallet.userWallet?.selectedAddress && pathname !== '/' && (
          <Button
            onClick={() =>
              setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
            }
            sx={{
              background: theme.gradient.landing,
              color: lightTheme.palette.common.white,
            }}
          >
            <FormattedMessage defaultMessage={'Connect A Wallet'} />
          </Button>
        )}
        <IconButton
          size="large"
          aria-label="Notional site navigation"
          aria-controls="menu-notional"
          aria-haspopup="true"
          color="inherit"
          onClick={
            anchorElNav
              ? (event) => handleCloseNavMenu(event)
              : (event) => handleOpenNavMenu(event)
          }
          sx={{ paddingRight: '0px', paddingLeft: theme.spacing(3) }}
        >
          {anchorElNav ? (
            <CloseX
              sx={{
                stroke: theme.palette.common.black,
              }}
            />
          ) : (
            <MenuIcon
              sx={{
                color: theme.palette.common.black,
              }}
            />
          )}
        </IconButton>
      </Box>

      <Drawer
        id="menu-notional"
        anchor="top"
        keepMounted
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        BackdropProps={{ invisible: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          color: theme.palette.common.black,
          width: 100,
          overflow: 'scroll',
          '& .MuiDrawer-paper, .MuiDrawer-paperAnchorTop': {
            top: { xs: 73, sm: 73 },
            background: theme.palette.background.paper,
            maxWidth: '100vw',
          },
        }}
      >
        <Tabs
          {...rest}
          value={selectedTab}
          onChange={handleChange}
          orientation="vertical"
          variant="scrollable"
          aria-label="Notional site Mobilenavigation"
          sx={{
            marginTop: theme.spacing(9),
            marginBottom: theme.spacing(8),
            '&.MuiTabs-root': {
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              zIndex: '9',
              height: '100vh',
            },
            '.MuiTabs-indicator': {
              display: 'none',
            },
            '.MuiTabs-scroller': {
              backgroundColor: theme.palette.background.paper,
              paddingBottom: theme.spacing(3),
            },
          }}
        >
          {mobileNavLinks.map((t) => (
            <Tab
              key={t.key}
              icon={t.iconImg}
              iconPosition="start"
              label={t.label}
              href={t.link}
              value={t.link}
              rel={t.external && t.target === '_blank' ? 'noreferrer' : ''}
              target={t.target || '_self'}
              component="a"
              disableRipple
              sx={{
                display: {
                  xs: 'flex',
                  md: 'none',
                },
                '.MuiSvgIcon-root': {
                  color: theme.palette.common.black,
                },
                '&.MuiTab-root, .MuiTab-labelIcon': {
                  opacity: 1,
                  color: theme.palette.common.black,
                  textTransform: 'capitalize',
                  fontSize: '1rem',
                  justifyContent: 'flex-start',
                  maxWidth: 'none',
                  width: '90%',
                  padding: '0px',
                  margin: 'auto',
                  borderBottom: theme.shape.borderStandard,
                },
                '&:hover': {
                  svg: {
                    filter:
                      'invert(63%) sepia(16%) saturate(1939%) hue-rotate(134deg) brightness(91%) contrast(96%)',
                  },
                  color: theme.palette.primary.light,
                },
                '&.Mui-selected': {
                  fontWeight: 700,
                },
              }}
            />
          ))}
          <MobileSubNav handleSideDrawer={handleSideDrawer} />
        </Tabs>

        <MobileSideDrawer
          dataKey={sideDrawerDataKey}
          setDrawerOpen={setDrawerOpen}
          drawerOpen={drawerOpen}
        />
      </Drawer>
    </>
  ) : (
    <Box></Box>
  );
}

export default MobileNavigation;
