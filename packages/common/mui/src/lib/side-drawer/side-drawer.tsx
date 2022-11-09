import { Box, SwipeableDrawer, useTheme, alpha } from '@mui/material';
import { defineMessage } from 'react-intl';
import { SideBarSubHeader } from '../side-bar-sub-header/side-bar-sub-header';

export interface SideDrawerProps {
  children: React.ReactNode;
  drawerOpen: boolean;
  callback: (drawerState: boolean) => void;
  CustomHeader?: ({ onClose }: { onClose: () => void }) => JSX.Element;
}

export function SideDrawer({ children, drawerOpen, callback, CustomHeader }: SideDrawerProps) {
  const theme = useTheme();
  const toggleDrawer = (open: boolean) => (event?: MouseEvent | KeyboardEvent) => {
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
        },
      }}
    >
      {CustomHeader && <CustomHeader onClose={toggleDrawer(false)} />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { sm: '100vw', md: '543px' },
          height: '100%',
          padding: '0px 48px',
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
