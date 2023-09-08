import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { BETA_ACCESS } from '@notional-finance/wallet/hooks';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { ReactNode } from 'react';

interface ContestButtonStackProps {
  to?: string;
  buttonText: ReactNode;
}

export const ContestButtonStack = ({
  to,
  buttonText,
}: ContestButtonStackProps) => {
  const theme = useTheme();
  const userSettings = getFromLocalStorage('userSettings');
  const { setWalletSideDrawer } = useSideDrawerManager();

  return (
    <ButtonContainer>
      <Button
        size="large"
        sx={{
          marginBottom: theme.spacing(3),
          width: '358px',
          fontFamily: 'Avenir Next',
          cursor: 'pointer',
        }}
        to={to ? to : undefined}
        onClick={() =>
          !to ? setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET) : null
        }
      >
        {buttonText}
      </Button>
      {userSettings.betaAccess !== BETA_ACCESS.CONFIRMED && (
        <Button
          size="large"
          variant="outlined"
          href="https://form.jotform.com/232396345681160"
          sx={{
            width: '358px',
            border: `1px solid ${colors.neonTurquoise}`,
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
        >
          <FormattedMessage defaultMessage={'Join Waitlist'} />
        </Button>
      )}
    </ButtonContainer>
  );
};

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(5)};
  display: flex;
  flex-direction: column;
  ${theme.breakpoints.down('md')} {
    align-items: center;
  }
  `
);

export default ContestButtonStack;
