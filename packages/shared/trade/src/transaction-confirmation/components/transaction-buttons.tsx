import { MouseEventHandler } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { ProgressIndicator, Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from './transaction-status';

const ButtonContainer = styled(Box)`
  margin-top: 40px;
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
`;

const Spinner = styled('span')`
  position: absolute;
  left: 0px;
  margin-top: 2px;
`;

export interface TransactionButtonsProps {
  transactionStatus: TransactionStatus;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  isLoaded: boolean;
  onReturnToForm?: MouseEventHandler<HTMLButtonElement>;
  isReadyOnlyAddress?: boolean;
}

export const TransactionButtons = ({
  transactionStatus,
  onSubmit,
  onCancel,
  onReturnToForm,
  isLoaded,
  isReadyOnlyAddress
}: TransactionButtonsProps) => {
  const theme = useTheme();
  switch (transactionStatus) {
    case TransactionStatus.PENDING:
    case TransactionStatus.CONFIRMED:
    case TransactionStatus.ERROR_BUILDING:
    case TransactionStatus.REVERT:
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
            disabled={isReadyOnlyAddress || !isLoaded}
          >
            {!isLoaded && (
              <Spinner>
                <ProgressIndicator type="circular" size={18} />
              </Spinner>
            )}
            <FormattedMessage defaultMessage={'Submit'} />
          </Button>
        </ButtonContainer>
      );
  }
};
