import { MouseEventHandler } from 'react';
import { styled, Box } from '@mui/material';
import { ProgressIndicator, Button } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from './transaction-status';

const ButtonContainer = styled(Box)`
  margin-top: 40px;
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
`;

const ReturnToForm = styled(Button)`
  width: 100%;
  margin-top: 30px;
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
}

export const TransactionButtons = ({
  transactionStatus,
  onSubmit,
  onCancel,
  onReturnToForm,
  isLoaded,
}: TransactionButtonsProps) => {
  switch (transactionStatus) {
    case TransactionStatus.PENDING:
    case TransactionStatus.CONFIRMED:
    case TransactionStatus.ERROR_BUILDING:
    case TransactionStatus.REVERT:
      return (
        <ReturnToForm variant="outlined" onClick={onReturnToForm || onCancel}>
          <FormattedMessage defaultMessage={'Return to Form'} />
        </ReturnToForm>
      );
    default:
      return (
        <ButtonContainer>
          <Button variant="outlined" size="large" onClick={onCancel}>
            <FormattedMessage defaultMessage={'Cancel'} />
          </Button>

          <Button variant="contained" size="large" onClick={onSubmit} disabled={!isLoaded}>
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
