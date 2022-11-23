import { Box } from '@mui/material';
import { ReactElement, useRef, useState, useEffect } from 'react';
// NOTE: Leaving this here incase we want to add it back in the future
import { TypeForm } from '../type-form/type-form';
import useWindowDimensions from '../hooks/use-window-dimensions/use-window-dimensions';

/* eslint-disable-next-line */
export interface SideBarLayoutProps {
  mainContent: ReactElement;
  sideBar: ReactElement;
  mobileHeader?: boolean;
}

export function SideBarLayout({
  mainContent,
  sideBar,
  mobileHeader,
}: SideBarLayoutProps) {
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
            xs: '17px',
            sm: '17px',
            md: '17px',
            lg: '48px',
            xl: '48px',
          },
          '&>div': {
            margin: '0 auto',
            width: '100%',
            marginBottom: {
              xs: '0px',
              sm: '0px',
              md: '0px',
              lg: '48px',
              xl: '48px',
            },
          },
        }}
      >
        {mainContent}
      </Box>
      <Box
        sx={{
          marginTop: mobileHeader
            ? { xs: '184px', sm: '184px', md: '0px', lg: '0px', xl: '0px' }
            : '0px',
          minHeight: '100%',
          flexGrow: { xs: 1, md: 1, lg: 0, xl: 0 },
          borderRadius: 'unset',
          '&>div': {
            height: '100%',
          },
        }}
      >
        {sideBar}
      </Box>
      <TypeForm />
    </Box>
  );
}

export default SideBarLayout;
