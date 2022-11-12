import { Box, useTheme } from '@mui/material';
import { INavLink } from '../../nav-link';
import { ArrowIcon } from '@notional-finance/icons';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';

export interface MobileSubNavProps {
  mobileSubNavLinks: INavLink[];
  handleSideDrawer: (event: any) => void;
}

const MobileSubNav = ({
  mobileSubNavLinks,
  handleSideDrawer,
}: MobileSubNavProps) => {
  const theme = useTheme();
  return (
    <>
      {mobileSubNavLinks.map((data) => (
        <Box
          key={data.key}
          sx={{
            display: 'flex',
            background: theme.palette.background.paper,
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {' '}
          <MobileNavTab data={data} handleClick={handleSideDrawer} />
          <ArrowIcon
            sx={{
              color: theme.palette.primary.light,
              position: 'absolute',
              right: '5%',
              transform: 'rotate(90deg)',
            }}
          />
        </Box>
      ))}
    </>
  );
};

export default MobileSubNav;
