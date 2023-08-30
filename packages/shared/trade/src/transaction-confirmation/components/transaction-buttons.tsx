import { MouseEventHandler } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { DiscordIcon } from '@notional-finance/icons';

const ButtonContainer = styled(Box)`
  margin-top: 40px;
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
`;

export interface TransactionButtonsProps {
  transactionStatus: TransactionStatus;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  isLoaded: boolean;
  onReturnToForm?: MouseEventHandler<HTMLButtonElement>;
  isDisabled: boolean;
}

export const TransactionButtons = ({
  transactionStatus,
  onSubmit,
  onCancel,
  onReturnToForm,
  isLoaded,
  isDisabled,
}: TransactionButtonsProps) => {
  const theme = useTheme();
  switch (transactionStatus) {
    case TransactionStatus.SUBMITTED:
    case TransactionStatus.CONFIRMED:
      return (
        <Button
          variant="outlined"
          onClick={onReturnToForm || onCancel}
          size="large"
          sx={{ marginTop: theme.spacing(4), width: '100%' }}
        >
          <FormattedMessage defaultMessage={'Return to Form'} />
        </Button>
      );
    case TransactionStatus.ERROR_BUILDING:
    case TransactionStatus.REVERT:
      return (
        <Box>
          <Button
            startIcon={<DiscordIcon />}
            variant="outlined"
            size="large"
            href={'https://discord.notional.finance'}
            sx={{ width: '100%' }}
          >
            <FormattedMessage defaultMessage={'Get Help in Discord'} />
          </Button>
          <Button
            onClick={onReturnToForm || onCancel}
            size="large"
            sx={{ marginTop: theme.spacing(3), width: '100%' }}
          >
            <FormattedMessage defaultMessage={'Return to Form'} />
          </Button>
        </Box>
      );
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
