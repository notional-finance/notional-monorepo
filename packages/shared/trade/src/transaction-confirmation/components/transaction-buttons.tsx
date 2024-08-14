import { MouseEventHandler } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { DiscordIcon } from '@notional-finance/icons';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useLocation } from 'react-router';
import { Network } from '@notional-finance/util';

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(4)};
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
  ${theme.breakpoints.up('md')} {
    @media(max-height: 970px) {
      position: fixed;
      bottom: 0;
      width: ${theme.spacing(56)};
      padding-top: ${theme.spacing(2.5)};
      padding-bottom: ${theme.spacing(6)};
      background: ${theme.palette.background.paper};
      box-shadow: 0 -50px 50px -20px ${theme.palette.background.paper};
    }
}
  
`
);

export interface TransactionButtonsProps {
  transactionStatus: TransactionStatus;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  isLoaded: boolean;
  network: Network | undefined;
  onReturnToForm?: MouseEventHandler<HTMLButtonElement>;
  isDisabled: boolean;
}

export const TransactionButtons = ({
  transactionStatus,
  network,
  onSubmit,
  onCancel,
  onReturnToForm,
  isLoaded,
  isDisabled,
}: TransactionButtonsProps) => {
  const theme = useTheme();
  const { clearSideDrawer } = useSideDrawerManager();
  const { pathname } = useLocation();
  const portfolioLink =
    pathname.includes('vaults') && network
      ? `/portfolio/${network}/vaults`
      : `/portfolio/${network}/holdings`;

  switch (transactionStatus) {
    case TransactionStatus.SUBMITTED:
    case TransactionStatus.CONFIRMED:
      return (
        <ButtonContainer>
          <Button
            to={portfolioLink}
            size="large"
            variant="outlined"
            sx={{ width: theme.spacing(56) }}
            onClick={() => clearSideDrawer()}
          >
            <FormattedMessage defaultMessage={'View In Portfolio'} />
          </Button>
        </ButtonContainer>
      );
    case TransactionStatus.ERROR_BUILDING:
    case TransactionStatus.REVERT:
      return (
        <ButtonContainer sx={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            startIcon={<DiscordIcon />}
            variant="outlined"
            size="large"
            href={'https://discord.notional.finance'}
            sx={{ width: theme.spacing(56) }}
          >
            <FormattedMessage defaultMessage={'Get Help in Discord'} />
          </Button>
          <Button
            onClick={onReturnToForm || onCancel}
            size="large"
            sx={{ marginTop: theme.spacing(3), width: theme.spacing(56) }}
          >
            <FormattedMessage defaultMessage={'Return to Form'} />
          </Button>
        </ButtonContainer>
      );
    case TransactionStatus.WAIT_USER_CONFIRM:
      return <Box></Box>;
    default:
      return (
        <ButtonContainer>
          <Button
            variant="outlined"
            size="large"
            sx={{ width: '48%' }}
            onClick={onCancel}
          >
            <FormattedMessage defaultMessage={'Cancel'} />
          </Button>

          <Button
            variant="contained"
            size="large"
            sx={{ width: '48%' }}
            onClick={onSubmit}
            disabled={isDisabled || !isLoaded}
          >
            <FormattedMessage defaultMessage={'Submit'} />
          </Button>
        </ButtonContainer>
      );
  }
};
