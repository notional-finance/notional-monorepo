import { Box, SwipeableDrawer, useTheme, alpha } from '@mui/material';
import { defineMessage } from 'react-intl';
import { SideBarSubHeader } from '../side-bar-sub-header/side-bar-sub-header';
import { useEffect, useState } from 'react';

export interface SideDrawerProps {
  children: React.ReactNode;
  openDrawer: boolean;
  callback: () => void;
  CustomHeader?: ({ onClose }: { onClose: () => void }) => JSX.Element;
  zIndex?: number;
  marginTop?: string;
  disableBackDrop?: boolean;
}

export function SideDrawer({
  children,
  openDrawer,
  callback,
  CustomHeader,
  zIndex,
  marginTop,
  disableBackDrop = false,
}: SideDrawerProps) {
  const theme = useTheme();

  const [isBannerActive, setIsBannerActive] = useState(false);

  useEffect(() => {
    const checkBannerStatus = () => {
      const bannerElement = document.querySelector(
        '[name="intercom-banner-frame"]'
      );
      setIsBannerActive(!!bannerElement);
    };
    checkBannerStatus();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          checkBannerStatus();
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <SwipeableDrawer
      anchor="right"
      open={openDrawer}
      onClose={() => callback()}
      onOpen={() => callback()}
      onBackdropClick={() => callback()}
      hideBackdrop={disableBackDrop}
      disableScrollLock={disableBackDrop}
      sx={{
        '.MuiBackdrop-root': {
          backgroundColor: alpha(theme.palette.background.accentDefault, 0.5),
        },
        '&.MuiModal-root, .MuiPopover-root': {
          zIndex: { xs: 1202, sm: 1202, md: 8 },
          height: { xs: '100vh', sm: '100vh', md: '100%' },
          position: { xs: 'absolute', sm: 'absolute', md: 'relative' },
        },
        '&.MuiPaper-root, .MuiPaper-elevation': {
          marginTop: isBannerActive ? theme.spacing(6) : '0px',
          overflowX: 'hidden',
          maxWidth: { xs: '100%', sm: '100%', md: '543px' },
          width: { xs: '100%', sm: '100%', md: '100%' },
          boxShadow: disableBackDrop ? 'none' : '',
        },
      }}
    >
      {CustomHeader && <CustomHeader onClose={() => callback()} />}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', sm: '100%', md: '100%' },
          height: '100%',
          position: { xs: 'absolute', sm: 'absolute', md: 'relative' },
          marginTop: {
            xs: '0px',
            sm: '0px',
            md: marginTop ? marginTop : '0px',
          },
          zIndex: zIndex ? zIndex : 8,
          padding: {
            xs: theme.spacing(0, 2),
            sm: theme.spacing(0, 2),
            md: theme.spacing(0, 6),
          },
        }}
      >
        {!CustomHeader && (
          <SideBarSubHeader
            callback={() => callback()}
            titleText={defineMessage({ defaultMessage: 'Back' })}
          />
        )}
        {children}
      </Box>
    </SwipeableDrawer>
  );
}
