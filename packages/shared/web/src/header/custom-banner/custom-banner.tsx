import { Box } from '@mui/material';
import { LinkText } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { useLocation } from 'react-router-dom';

export const CustomBanner = () => {
  // const theme = useTheme();
  const {
    globalState: { isStarterBoostUser },
  } = useNotionalContext();
  const { pathname } = useLocation();
  return isStarterBoostUser && pathname.includes('portfolio') ? (
    <Box
      sx={{
        height: '50px',
        width: '100%',
        backgroundColor: colors.neonTurquoise,
        color: colors.black,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          margin: '0 auto',
          padding: '0 32px',
        }}
      >
        <LinkText to="/new-user" style={{ color: 'black' }}>
          <FormattedMessage defaultMessage="You're eligible: Earn boosted APYs on new deposits until Dec 10th!" />
        </LinkText>
      </Box>
    </Box>
  ) : null;
};
