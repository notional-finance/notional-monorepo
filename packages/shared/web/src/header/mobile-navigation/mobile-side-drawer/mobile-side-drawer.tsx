import { SetStateAction, Dispatch } from 'react';
import { Toolbar, Box, Tabs, useTheme } from '@mui/material';
import { useSideDrawerLinks } from '../use-side-drawer-links';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { ArrowIcon } from '@notional-finance/icons';
import MobileSideDrawerResources from '../mobile-side-drawer-resources/mobile-side-drawer-resources';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/util';
import {
  SettingsSideDrawer,
  NotificationsSideDrawer,
} from '@notional-finance/wallet';
import { FormattedMessage } from 'react-intl';
import { H4 } from '@notional-finance/mui';
import { KeyboardEvent, MouseEvent } from 'react';

interface MobileSideDrawer {
  dataKey: MOBILE_SUB_NAV_ACTIONS;
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
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
          display:
            dataKey === MOBILE_SUB_NAV_ACTIONS.SETTINGS ||
            dataKey === MOBILE_SUB_NAV_ACTIONS.NOTIFICATIONS
              ? 'none'
              : 'flex',
          '&.MuiToolbar-root': {
            minHeight: theme.spacing(9),
            padding: '0px',
            zIndex: '10',
            boxShadow: '0px 0px 6px rgb(25 19 102 / 11%)',
            borderBottom: `1px solid ${theme.palette.borders.default}`,
          },
        }}
      >
        <Box
          sx={{
            width: '90%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginLeft: theme.spacing(2),
          }}
        >
          <Box sx={{ display: 'flex' }} onClick={toggleDrawer(false)}>
            <ArrowIcon
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
        </Box>
      </Toolbar>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        aria-label="Notional site Mobilenavigation"
        selectionFollowsFocus={true}
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
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        {dataKey === MOBILE_SUB_NAV_ACTIONS.RESOURCES ? (
          <MobileSideDrawerResources />
        ) : dataKey === MOBILE_SUB_NAV_ACTIONS.SETTINGS ? (
          <SettingsSideDrawer toggleDrawer={setDrawerOpen} />
        ) : dataKey === MOBILE_SUB_NAV_ACTIONS.NOTIFICATIONS ? (
          <NotificationsSideDrawer toggleDrawer={setDrawerOpen} />
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
