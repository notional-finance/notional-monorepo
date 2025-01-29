import { SetStateAction, Dispatch } from 'react';
import { Toolbar, Box, Tabs, useTheme } from '@mui/material';
import { useSideDrawerLinks } from '../use-side-drawer-links';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { ArrowIcon } from '@notional-finance/icons';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/util';
import { SettingsSideDrawer } from '@notional-finance/wallet';
import { FormattedMessage } from 'react-intl';
import { H4, SectionTitle } from '@notional-finance/mui';
import { KeyboardEvent, MouseEvent } from 'react';

interface MobileSideDrawer {
  dataKey: MOBILE_SUB_NAV_ACTIONS;
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  closeDrawer: () => void;
}

const MobileSideDrawer = ({
  dataKey,
  drawerOpen,
  setDrawerOpen,
  closeDrawer,
}: MobileSideDrawer) => {
  const theme = useTheme();
  const { linkData, label } = useSideDrawerLinks(dataKey);

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
        marginTop: '72px',
        backgroundColor: theme.palette.background.default,
        '&.MuiModal-root, .MuiDrawer-root': {
          marginTop: '72px',
          zIndex: '1200',
          backgroundColor: theme.palette.background.default,
        },
        '.MuiPaper-root': {
          marginTop: '72px',
          width: '100%',
          backgroundColor: theme.palette.background.default,
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
            dataKey === MOBILE_SUB_NAV_ACTIONS.SETTINGS ? 'none' : 'flex',
          '&.MuiToolbar-root': {
            minHeight: theme.spacing(9),
            padding: '0px',
            zIndex: '10',
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
                fontWeight: theme.typography.fontWeightMedium,
              }}
            >
              <FormattedMessage defaultMessage="Menu" />
            </H4>
          </Box>
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
        {dataKey !== MOBILE_SUB_NAV_ACTIONS.SETTINGS && (
          <SectionTitle
            sx={{
              width: '90%',
              margin: 'auto',
              marginTop: theme.spacing(2),
              fontWeight: 600,
              color: theme.palette.typography.light,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '12px',
            }}
          >
            {label}
          </SectionTitle>
        )}
        {dataKey === MOBILE_SUB_NAV_ACTIONS.SETTINGS ? (
          <SettingsSideDrawer toggleDrawer={setDrawerOpen} />
        ) : (
          linkData.map((data) => (
            <MobileNavTab
              handleCloseDrawer={closeDrawer}
              key={data.key}
              data={data}
            />
          ))
        )}
      </Tabs>
    </SwipeableDrawer>
  );
};

export default MobileSideDrawer;
