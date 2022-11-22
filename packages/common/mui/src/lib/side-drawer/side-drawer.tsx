import { Box, SwipeableDrawer, useTheme, alpha } from '@mui/material';
import { defineMessage } from 'react-intl';
import { SideBarSubHeader } from '../side-bar-sub-header/side-bar-sub-header';

export interface SideDrawerProps {
  children: React.ReactNode;
  drawerOpen: boolean;
  callback: (drawerState: boolean) => void;
  CustomHeader?: ({ onClose }: { onClose: () => void }) => JSX.Element;
}

export function SideDrawer({
  children,
  drawerOpen,
  callback,
  CustomHeader,
}: SideDrawerProps) {
  const theme = useTheme();
  const toggleDrawer =
    (open: boolean) => (event?: MouseEvent | KeyboardEvent) => {
      if (event?.type === 'keydown') {
        const e = event as KeyboardEvent;
        if (e.key === 'Tab' || e.key === 'Shift') return;
      }
      callback(open);
    };

  return (
    <SwipeableDrawer
      anchor="right"
      open={drawerOpen}
      onClose={() => toggleDrawer(false)}
      onOpen={() => toggleDrawer(true)}
      onBackdropClick={() => callback(false)}
      sx={{
        '.MuiBackdrop-root': {
          backgroundColor: alpha(theme.palette.background.accentDefault, 0.5),
        },
        '&.MuiModal-root, .MuiPopover-root': {
          zIndex: 8,
        },
        '&.MuiPaper-root, .MuiPaper-elevation': {
          overflowX: 'hidden',
          maxWidth: { xs: '100%', sm: '100%', md: '543px' },
        },
      }}
    >
      {CustomHeader && <CustomHeader onClose={toggleDrawer(false)} />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', sm: '100%', md: '543px' },
          height: '100%',
          padding: {
            xs: theme.spacing(0, 2),
            sm: theme.spacing(0, 2),
            md: theme.spacing(0, 6),
          },
        }}
      >
        {!CustomHeader && (
          <SideBarSubHeader
            callback={toggleDrawer(false)}
            titleText={defineMessage({ defaultMessage: 'back' })}
          />
        )}
        {children}
      </Box>
    </SwipeableDrawer>
  );
}

export default SideDrawer;
