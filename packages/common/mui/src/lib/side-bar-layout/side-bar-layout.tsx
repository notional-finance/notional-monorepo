import { Box } from '@mui/material';
import { ReactElement, useRef, useState, useEffect } from 'react';
// NOTE: Leaving this here incase we want to add it back in the future
// import { TypeForm } from '../type-form/type-form';
import useWindowDimensions from '../hooks/use-window-dimensions/use-window-dimensions';

/* eslint-disable-next-line */
export interface SideBarLayoutProps {
  mainContent: ReactElement;
  sideBar: ReactElement;
}

export function SideBarLayout({ mainContent, sideBar }: SideBarLayoutProps) {
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
        minHeight: `${viewHeight}px`,
      }}
    >
      <Box
        sx={{
          minHeight: '100%',
          flexGrow: 1,
          display: 'inline-flex',
          marginTop: '48px',
          '&>div': {
            margin: '0 auto',
            width: '100%',
            marginBottom: '48px',
          },
        }}
      >
        {mainContent}
      </Box>
      <Box
        sx={{
          minHeight: '100%',
          flexGrow: 0,
          borderRadius: 'unset',
          '&>div': {
            height: '100%',
          },
        }}
      >
        {sideBar}
      </Box>
      {/* <TypeForm /> */}
    </Box>
  );
}

export default SideBarLayout;
