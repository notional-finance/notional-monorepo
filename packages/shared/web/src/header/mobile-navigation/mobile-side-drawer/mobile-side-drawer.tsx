import { Toolbar, Box, Tabs, useTheme } from '@mui/material';
import { useSideDrawerLinks } from '../use-side-drawer-links';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { ArrowIcon } from '@notional-finance/icons';
import MobileSideDrawerResources from '../mobile-side-drawer-resources/mobile-side-drawer-resources';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { H4 } from '@notional-finance/mui';
import { KeyboardEvent, MouseEvent } from 'react';

interface MobileSideDrawer {
  dataKey: MOBILE_SUB_NAV_ACTIONS;
  drawerOpen: boolean;
  setDrawerOpen: (prop: boolean) => void;
}

const MobileSideDrawer = ({
  dataKey,
  drawerOpen,
  setDrawerOpen,
}: MobileSideDrawer) => {
  const theme = useTheme();
  const sideDrawerLinks = useSideDrawerLinks(dataKey);

  const toggleDrawer =
    (open: boolean) => (event: MouseEvent | KeyboardEvent) => {
      if (event?.type === 'keydown') {
        const e = event as KeyboardEvent;
        if (e.key === 'Tab' || e.key === 'Shift') return;
      }
      setDrawerOpen(open);
    };

  return (
    <SwipeableDrawer
      sx={{
        '&.MuiModal-root, .MuiDrawer-root': {
          zIndex: '9999',
        },
        '.MuiPaper-root': {
          width: '100%',
        },
      }}
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
    >
      <Toolbar
        sx={{
          '&.MuiToolbar-root': {
            height: '4.6rem',
            padding: '0px',
            zIndex: '10',
            boxShadow: '0px 0px 6px rgb(25 19 102 / 11%)',
          },
        }}
      >
        <Box sx={{ width: '90%', margin: 'auto', display: 'flex' }}>
          <ArrowIcon
            onClick={toggleDrawer(false)}
            sx={{
              transform: 'rotate(-90deg)',
              color: theme.palette.common.black,
            }}
          />
          <H4
            sx={{
              marginLeft: theme.spacing(1),
              fontWeight: theme.typography.fontWeightRegular,
            }}
          >
            <FormattedMessage defaultMessage="back" />
          </H4>
        </Box>
      </Toolbar>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        aria-label="Notional site Mobilenavigation"
        value={false}
        sx={{
          '&.MuiTabs-root': {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
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
        {dataKey === MOBILE_SUB_NAV_ACTIONS.RESOURCES ? (
          <MobileSideDrawerResources />
        ) : (
          sideDrawerLinks.map((data) => (
            <MobileNavTab key={data.key} data={data} />
          ))
        )}
      </Tabs>
    </SwipeableDrawer>
  );
};

export default MobileSideDrawer;
