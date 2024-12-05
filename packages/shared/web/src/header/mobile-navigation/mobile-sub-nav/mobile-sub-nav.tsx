import { Box, useTheme } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { useTruncatedAddress } from '@notional-finance/notionable-hooks';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/util';
import { useNavLinks } from '../../use-nav-links';
import { H4 } from '@notional-finance/mui';
export interface MobileSubNavProps {
  handleSideDrawer: (event: any) => void;
}

const MobileSubNav = ({ handleSideDrawer }: MobileSubNavProps) => {
  const theme = useTheme();
  const { mobileSubNavLinks } = useNavLinks(true, theme);
  const truncatedAddress = useTruncatedAddress();

  return (
    <>
      {mobileSubNavLinks.map((data) => (
        <Box
          key={data.key}
          sx={{
            display: 'flex',
            background: theme.palette.background.default,
            boxShadow: 'none',
            alignItems: 'center',
            borderTop:
              data.key === MOBILE_SUB_NAV_ACTIONS.SETTINGS
                ? theme.shape.borderStandard
                : '',
            marginTop:
              data.key === MOBILE_SUB_NAV_ACTIONS.SETTINGS
                ? theme.spacing(2)
                : '',
            paddingTop:
              data.key === MOBILE_SUB_NAV_ACTIONS.SETTINGS
                ? theme.spacing(2)
                : '',
          }}
        >
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
