import { Button } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { Network, THEME_VARIANTS } from '@notional-finance/util';
import { Link, useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LaunchIcon } from '@notional-finance/icons';
import { useAccount as useWagmiAccount } from 'wagmi';

export function LaunchAppButton() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const params = useParams<any>();
  const { address } = useWagmiAccount();
  const network = params?.selectedNetwork || Network.mainnet;

  return (
    <Button
      component={Link}
      to={
        address
          ? `/portfolio/${network}/overview`
          : `/portfolio/${network}/welcome`
      }
      variant="outlined"
      color="primary"
      endIcon={
        <LaunchIcon
          sx={{
            color: theme.palette.common.white,
            marginTop: '5px',
          }}
        />
      }
      sx={{
        height: theme.spacing(5),
        '&.MuiButton-root': {
          borderRadius: theme.shape.borderRadius(),
          fontSize: '1rem',
          textTransform: 'capitalize',
          color: theme.palette.common.white,
          padding: '5px 20px',
          background: theme.gradient.landing,
        },
      }}
    >
      <FormattedMessage defaultMessage="Launch App" />
    </Button>
  );
}

export default LaunchAppButton;
