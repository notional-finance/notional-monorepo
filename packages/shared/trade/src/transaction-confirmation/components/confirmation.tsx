import { useCallback } from 'react';
import { Divider, styled, useTheme, Box } from '@mui/material';
import {
  ExternalLink,
  HeadingSubtitle,
  ErrorMessage,
} from '@notional-finance/mui';
import { TokenDefinition } from '@notional-finance/core-entities';
import { TradeState } from '@notional-finance/notionable';
import {
  BaseTradeContext,
  TransactionStatus,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { TransactionButtons } from './transaction-buttons';
import { PortfolioCompare } from './portfolio-compare';
import { OrderDetails } from './order-details';
import { PendingTransaction } from './pending-transaction';
import { FormattedMessage } from 'react-intl';

export interface ConfirmationProps {
  context: BaseTradeContext;
  onCancel?: () => void;
  onReturnToForm?: () => void;
}

export const Confirmation = ({
  context,
  onCancel,
  onReturnToForm,
}: ConfirmationProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const {
    populatedTransaction,
    transactionError,
    debt,
    collateral,
    tradeType,
  } = state;
  const { isReadOnlyAddress, transactionStatus, transactionHash, onSubmit } =
    useTransactionStatus();
  const onTxnCancel = useCallback(() => {
    updateState({ confirm: false });
  }, [updateState]);

  return (
    <>
      <TermsOfService theme={theme}>
        {transactionStatus === TransactionStatus.NONE && (
          <FormattedMessage
            defaultMessage={
              'By submitting a trade on our platform you agree to our <a>terms of service.</a>'
            }
            values={{
              a: (msg: string) => (
                <ExternalLink
                  href="/terms"
                  style={{ color: theme.palette.primary.light }}
                >
                  {msg}
                </ExternalLink>
              ),
            }}
          />
        )}
        {transactionStatus === TransactionStatus.SUBMITTED && (
          <FormattedMessage
            defaultMessage={
              'You will be notified when the transaction is complete.'
            }
          />
        )}
      </TermsOfService>

      <Divider
        variant="fullWidth"
        sx={{ background: 'white', marginBottom: theme.spacing(6) }}
      />

      <OrderDetails state={state} />
      {transactionHash && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
        />
      )}
      {(transactionStatus === TransactionStatus.REVERT || transactionError) && (
        <Box sx={{ height: theme.spacing(8), marginBottom: theme.spacing(6) }}>
          <ErrorMessage
            variant="error"
            marginBottom
            message={
              transactionError ? (
                transactionError
              ) : (
                <FormattedMessage defaultMessage={'Transaction Reverted'} />
              )
            }
          />
        </Box>
      )}
      {(transactionStatus === TransactionStatus.NONE ||
        transactionStatus === TransactionStatus.WAIT_USER_CONFIRM) &&
        transactionError === undefined && (
          <PortfolioCompare state={state as TradeState} />
        )}
      <TransactionButtons
        transactionStatus={
          transactionError
            ? TransactionStatus.ERROR_BUILDING
            : transactionStatus
        }
        onSubmit={() =>
          onSubmit(
            tradeType || 'unknown',
            populatedTransaction,
            [debt, collateral].filter(
              (t) => t !== undefined
            ) as TokenDefinition[]
          )
        }
        onCancel={onCancel || onTxnCancel}
        onReturnToForm={onReturnToForm}
        isDisabled={isReadOnlyAddress || !!transactionError}
        isLoaded={populatedTransaction !== undefined}
      />
    </>
  );
};

const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    color: ${theme.palette.typography.light};
    font-size: 14px;
  `
);

export default Confirmation;
