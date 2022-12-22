import { Box, useTheme } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { useAccount } from '@notional-finance/notionable-hooks';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { useNavLinks } from '../../use-nav-links';
import { H4 } from '@notional-finance/mui';
export interface MobileSubNavProps {
  handleSideDrawer: (event: any) => void;
}

const MobileSubNav = ({ handleSideDrawer }: MobileSubNavProps) => {
  const theme = useTheme();
  const { mobileSubNavLinks } = useNavLinks(true, theme);
  const { truncatedAddress } = useAccount();
  return (
    <>
      {mobileSubNavLinks.map((data) => (
        <Box
          key={data.key}
          sx={{
            display: 'flex',
            background:
              data.key === MOBILE_SUB_NAV_ACTIONS.SETTINGS ||
              data.key === MOBILE_SUB_NAV_ACTIONS.NOTIFICATIONS
                ? theme.palette.background.paper
                : theme.palette.info.light,
            boxShadow:
              data.key === MOBILE_SUB_NAV_ACTIONS.COMPANY
                ? theme.shape.shadowStandard
                : 'none',
            alignItems: 'center',
            zIndex: data.key === MOBILE_SUB_NAV_ACTIONS.COMPANY ? 3 : 2,
          }}
        >
          {' '}
          <MobileNavTab data={data} handleClick={handleSideDrawer} />
          <Box
            sx={{
              position: 'absolute',
              right: '5%',
              display: 'flex',
              alignItems: 'end',
            }}
          >
            <H4
              sx={{
                marginRight: theme.spacing(1),
                fontWeight: theme.typography.fontWeightRegular,
              }}
            >
              {truncatedAddress && data.key === 'settings' && truncatedAddress}
            </H4>
            <ArrowIcon
              sx={{
                color: theme.palette.primary.light,
                transform: 'rotate(90deg)',
              }}
            />
          </Box>
        </Box>
      ))}
    </>
  );
};

export default MobileSubNav;
