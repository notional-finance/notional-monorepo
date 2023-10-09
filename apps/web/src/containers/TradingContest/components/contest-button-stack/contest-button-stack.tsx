import { Box, styled, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { ReactNode } from 'react';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { BETA_ACCESS } from '@notional-finance/notionable';

interface ContestButtonStackProps {
  to?: string;
  buttonText: ReactNode;
}

export const ContestButtonStack = ({
  to,
  buttonText,
}: ContestButtonStackProps) => {
  const theme = useTheme();
  const {
    globalState: { hasContestNFT },
  } = useNotionalContext();

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
      {hasContestNFT !== BETA_ACCESS.CONFIRMED && (
        <Button
          size="large"
          variant="outlined"
          href="https://docs.google.com/forms/d/e/1FAIpQLSfaQV96qU6ucw_zL3ypQLMrPnPxHWYQr9oQO7eYHWwZ12T80A/closedform"
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
