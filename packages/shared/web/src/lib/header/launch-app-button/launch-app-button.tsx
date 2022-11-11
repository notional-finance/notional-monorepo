import { Button } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LaunchIcon } from '@notional-finance/icons';

/* eslint-disable-next-line */
export interface LaunchAppButtonProps {
  onLaunch: () => void;
}

export function LaunchAppButton({ onLaunch }: LaunchAppButtonProps) {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);

  return (
    <Button
      component={Link}
      to="/portfolio/overview"
      variant="outlined"
      color="primary"
      onClick={onLaunch}
      endIcon={
        <LaunchIcon
          sx={{
            color: theme.palette.common.white,
            marginTop: '5px',
          }}
        />
      }
      sx={{
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
