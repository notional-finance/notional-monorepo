import { Button } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LaunchIcon } from '@notional-finance/icons';
import {
  useAccountAndBalanceReady,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';

export function LaunchAppButton() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const defaultNetwork =
    useWalletConnectedNetwork() ||
    getDefaultNetworkFromHostname(window.location.hostname);
  const isAcctAndBalanceReady = useAccountAndBalanceReady(defaultNetwork);

  return (
    <Button
      component={Link}
      to={
        isAcctAndBalanceReady
          ? `/portfolio/${defaultNetwork}/overview`
          : `/portfolio/${defaultNetwork}/welcome`
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
