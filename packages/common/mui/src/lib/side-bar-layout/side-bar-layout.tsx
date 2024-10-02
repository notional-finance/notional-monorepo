import { Box, useTheme } from '@mui/material';
import { ReactElement, useRef, useState, useEffect } from 'react';
import useWindowDimensions from '../hooks/use-window-dimensions/use-window-dimensions';

 
export interface SideBarLayoutProps {
  mainContent: ReactElement;
  sideBar: ReactElement;
  showTransactionConfirmation?: boolean;
}

export function SideBarLayout({
  mainContent,
  sideBar,
  showTransactionConfirmation,
}: SideBarLayoutProps) {
  const theme = useTheme();
  const [viewHeight, setViewHeight] = useState(0);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    if (viewRef.current && viewRef.current.parentElement) {
      setViewHeight(viewRef.current.parentElement.clientHeight);
    }
  }, [windowDimensions, viewRef]);

  return (
    <Box
      ref={viewRef}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: {
          xs: '0px',
          sm: '0px',
          md: '0px',
          lg: `${viewHeight}px`,
          xl: `${viewHeight}px`,
        },
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'inline-flex',
          marginTop: {
            xs: theme.spacing(2),
            sm: theme.spacing(2),
            md: theme.spacing(6),
            lg: theme.spacing(6),
            xl: theme.spacing(6),
          },
          '&>div': {
            margin: '0 auto',
            width: '100%',
            marginBottom: {
              xs: '0px',
              sm: '0px',
              md: theme.spacing(12.5),
              lg: theme.spacing(6),
              xl: theme.spacing(6),
            },
          },
        }}
      >
        {mainContent}
      </Box>
      <Box
        sx={{
          minHeight: '100%',
          flexGrow: { xs: 1, md: 1, lg: 0, xl: 0 },
          borderRadius: 'unset',
          width: { xs: '100%', sm: '100%', md: 'auto', lg: 'auto', xl: 'auto' },
          '&>div': {
            height: '100%',
          },
          zIndex: showTransactionConfirmation ? 5 : 2,
        }}
      >
        {sideBar}
      </Box>
    </Box>
  );
}

export default SideBarLayout;
