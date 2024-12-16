import { Box, useTheme } from '@mui/material';
import { LinkText } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { TreeIcon } from '@notional-finance/icons';

export const CustomBanner = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: theme.spacing(7),
        width: '100%',
        backgroundColor: colors.neonTurquoise,
        color: colors.black,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
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
          color: colors.black,
          fontSize: '16px',
        }}
      >
        <TreeIcon fill={colors.black} sx={{ marginRight: theme.spacing(1) }} />
        <FormattedMessage defaultMessage="Introducing Season of Deposits! Earn an extra 5.0% APY!" />
        <LinkText
          to="/boost-view"
          style={{
            color: colors.black,
            fontSize: '16px',
            marginLeft: theme.spacing(1),
          }}
        >
          <FormattedMessage defaultMessage="See Details" />
        </LinkText>
      </Box>
    </Box>
  );
};
