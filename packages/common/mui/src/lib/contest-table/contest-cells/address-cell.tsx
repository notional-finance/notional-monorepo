import { LaunchIcon } from '@notional-finance/icons';
import { Box } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { truncateAddress } from '@notional-finance/helpers';

export const addressCell = ({ cell }) => {
  const { value } = cell;
  return (
    <Box
      component={'a'}
      href={''}
      sx={{
        color: colors.neonTurquoise,
        textDecoration: 'underline',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        cursor: 'pointer',
        '&:hover': {
          background: colors.neonTurquoise,
          color: colors.black,
          transition: 'all 0.3s ease',
          borderRadius: '6px',
        },
      }}
    >
      {value ? truncateAddress(value) : ''}
      <LaunchIcon
        sx={{
          marginTop: '5px',
          marginLeft: '8px',
        }}
      />
    </Box>
  );
};

export default addressCell;
