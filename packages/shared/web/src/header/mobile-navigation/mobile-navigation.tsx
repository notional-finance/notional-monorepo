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
import { useLocation, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SyntheticEvent } from 'react';
import { ReactElement } from 'react';
import { MouseEvent } from 'react';
import MobileSubNav from './mobile-sub-nav/mobile-sub-nav';
import MobileSideDrawer from './mobile-side-drawer/mobile-side-drawer';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { useNavLinks } from '../use-nav-links';

export interface MobileNavigationProps extends TabsProps {
  rightButton?: ReactElement;
}

export function MobileNavigation({
  rightButton,
  ...rest
}: MobileNavigationProps) {
  const theme = useTheme();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState<string | false>(false);
  const { navLinks, mobileSubNavLinks } = useNavLinks(true, theme);
  const { pathname } = useLocation();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [sideDrawerDataKey, setSideDrawerDataKey] =
    useState<MOBILE_SUB_NAV_ACTIONS>(MOBILE_SUB_NAV_ACTIONS.INVEST_AND_EARN);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const currentTab =
    navLinks.find(({ link }) => link === pathname)?.link || false;

  useEffect(() => {
    setSelectedTab(currentTab);
    setAnchorElNav(null);
  }, [currentTab]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    event.preventDefault();
    const item = navLinks.find((t) => t.link === newValue);
    if (item && item.external) {
      window.open(newValue, item.target);
    } else {
      history.push(newValue);
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
      >
        {anchorElNav ? (
          <CloseX
            sx={{
              marginLeft: '5px',
              marginTop: '5px',
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
      <Drawer
        id="menu-notional"
        anchor="top"
        keepMounted
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        sx={{
          display: { xs: 'block', lg: 'none' },
          color: theme.palette.common.black,
          width: 100,
          overflow: 'scroll',
          '& .MuiDrawer-paper, .MuiDrawer-paperAnchorTop': {
            top: { xs: 56, sm: 64 },
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
            marginBottom: theme.spacing(8),
            '&.MuiTabs-root': {
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              boxShadow: '0px 0px 6px rgb(25 19 102 / 11%)',
              zIndex: '9',
            },
            '.MuiTabs-indicator': {
              display: 'none',
            },
            '.MuiTabs-scroller': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <Box
            sx={{
              padding: '45px 20px 30px 20px',
              width: '100%',
              textAlign: 'center',
              maxWidth: {
                xs: '286px',
                sm: '286px',
                md: '0px',
                lg: '0px',
                xl: '0px',
              },
              margin: {
                xs: 'auto',
                sm: 'auto',
                md: '0px',
                lg: '0px',
                xl: '0px',
              },
            }}
          >
            {rightButton}
          </Box>
          {navLinks.map((t) => (
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
              onClick={handleCloseNavMenu}
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
                  borderBottom:
                    t.key !== 'provide' ? '1px solid #089CA3' : 'none',
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
          <MobileSubNav
            mobileSubNavLinks={mobileSubNavLinks}
            handleSideDrawer={handleSideDrawer}
          />
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
