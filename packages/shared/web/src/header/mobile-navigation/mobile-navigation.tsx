import { Tab, Tabs, Drawer, Box, useTheme, styled } from '@mui/material';
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
import { truncateAddress } from '@notional-finance/helpers';
import {
  useAppStore,
  useSideDrawerState,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { NotionalTheme, useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useNavLinks } from '../use-nav-links';
import { Button, H4, SectionTitle } from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';
import { MobileNetworkSelector } from '@notional-finance/wallet';
import { NotionalIcon } from '@notional-finance/icons';
import { observer } from 'mobx-react-lite';

// Define a type for the props
type StyledBurgerProps = {
  theme: NotionalTheme; // Replace 'any' with the actual theme type if available
  open: boolean;
};

const StyledBurger = styled('button', {
  shouldForwardProp: (prop: string) => prop !== 'open',
})<StyledBurgerProps>(({ theme, open }) => ({
  marginLeft: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  width: '2rem',
  height: '2rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  zIndex: 10,

  '&:focus': {
    outline: 'none',
  },

  '& div': {
    width: '2rem',
    height: '2px',
    background: theme.palette.typography.main,
    borderRadius: '10px',
    transition: 'all 0.3s linear',
    position: 'relative',
    transformOrigin: '1px',

    '&:first-of-type': {
      transform: open ? 'rotate(45deg)' : 'rotate(0)',
    },

    '&:nth-of-type(2)': {
      opacity: open ? 0 : 1,
      transform: open ? 'translateX(20px)' : 'translateX(0)',
    },

    '&:nth-of-type(3)': {
      transform: open ? 'rotate(-45deg)' : 'rotate(0)',
    },
  },
}));

export const MobileNavigation = observer(() => {
  const theme = useTheme();
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const walletStore = useWalletStore();
  const { mobileNavOpen, setMobileNavOpen } = useAppStore();
  const { setWalletSideDrawer, clearWalletSideDrawer } = useSideDrawerManager();
  const { mobileNavLinks } = useNavLinks(true, theme);
  const [selectedTab, setSelectedTab] = useState<string | false>(false);
  const [mainNavOpen, setMainNavOpen] = useState<boolean>(false);
  const { currentSideDrawerKey } = useSideDrawerState();

  const currentTab = mobileNavLinks.find(({ link }) => link === pathname);

  useEffect(() => {
    setSelectedTab(currentTab?.link || false);
    setMainNavOpen(false);
  }, [currentTab?.link]);

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

  const handleOpenNavMenu = () => {
    setMainNavOpen(true);
    setMobileNavOpen(true);
  };

  const handleCloseNavMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setMainNavOpen(false);
    clearWalletSideDrawer();
    setDrawerOpen(false);
    setMobileNavOpen(false);
  };

  const handleSideDrawer = (event: any) => {
    event.preventDefault();
    const dataKey = event.target.getAttribute('data-key');
    setSideDrawerDataKey(dataKey);
    setDrawerOpen(true);
  };

  return window.innerWidth <= theme.breakpoints.values.sm ? (
    <Box
      sx={{
        background: theme.palette.background.paper,
        width: '90%',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <H4 to="/">
        <NotionalIcon />
      </H4>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {currentSideDrawerKey !== 'connect-wallet' && !mobileNavOpen && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {!walletStore.userWallet?.selectedAddress && pathname !== '/' && (
              <Button
                onClick={() =>
                  setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
                }
                sx={{
                  padding: theme.spacing(1, 2),
                  height: 'fit-content',
                  background: theme.gradient.landing,
                  color: lightTheme.palette.common.white,
                }}
              >
                <FormattedMessage defaultMessage={'Connect'} />
              </Button>
            )}
            {walletStore.userWallet?.selectedAddress && pathname !== '/' && (
              <Box
                sx={{
                  color: theme.palette.typography.main,
                  padding: theme.spacing(1),
                  border: `1px solid ${theme.palette.primary.light}`,
                  borderRadius: theme.shape.borderRadius(),
                }}
              >
                {truncateAddress(walletStore.userWallet?.selectedAddress)}
              </Box>
            )}
            <MobileNetworkSelector />
          </Box>
        )}
        <StyledBurger
          open={
            mobileNavOpen || currentSideDrawerKey === 'connect-wallet'
              ? true
              : false
          }
          onClick={
            mobileNavOpen || currentSideDrawerKey === 'connect-wallet'
              ? (event) => handleCloseNavMenu(event)
              : () => handleOpenNavMenu()
          }
          theme={theme}
        >
          <div />
          <div />
          <div />
        </StyledBurger>
      </Box>

      <Drawer
        id="menu-notional"
        anchor="top"
        keepMounted
        open={mainNavOpen}
        onClose={handleCloseNavMenu}
        sx={{
          height: '100vh',
          display: { xs: 'block', lg: 'none' },
          color: theme.palette.common.black,
          width: 100,
          overflow: 'scroll',
          '& .MuiDrawer-paper, .MuiDrawer-paperAnchorTop': {
            top: { xs: 73, sm: 73 },
            background: theme.palette.background.default,
            maxWidth: '100vw',
          },
        }}
      >
        <Tabs
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
              backgroundColor: theme.palette.background.default,
              paddingBottom: theme.spacing(3),
            },
          }}
        >
          <SectionTitle
            msg={defineMessage({ defaultMessage: 'APP' })}
            sx={{
              width: '90%',
              margin: 'auto',
              marginTop: theme.spacing(4),
              fontWeight: 600,
              color: theme.palette.typography.light,
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          />
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
    </Box>
  ) : (
    <Box></Box>
  );
});
