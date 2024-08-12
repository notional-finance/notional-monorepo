import { useCallback, useEffect } from 'react';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { Divider, styled, useTheme, Box } from '@mui/material';
import { useLocation } from 'react-router';
import {
  ExternalLink,
  HeadingSubtitle,
  ErrorMessage,
  ScrollToTop,
} from '@notional-finance/mui';
import { TokenDefinition } from '@notional-finance/core-entities';
import {
  StatusHeading,
  TransactionButtons,
  PortfolioCompare,
  OrderDetails,
  PendingTransaction,
} from './components';
import {
  BaseTradeContext,
  VaultContext,
  TransactionStatus,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { clearTradeState } from '@notional-finance/notionable';

export interface TransactionConfirmationProps {
  heading: React.ReactNode;
  context: BaseTradeContext | VaultContext;
  onCancel?: () => void;
  onReturnToForm?: () => void;
  isWithdraw?: boolean;
}

export const TransactionConfirmation = ({
  heading,
  context,
  onCancel,
  onReturnToForm,
}: TransactionConfirmationProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const location = useLocation();
  const {
    populatedTransaction,
    transactionError,
    simulationError,
    debt,
    collateral,
    tradeType,
    selectedNetwork,
  } = state;
  const { isReadOnlyAddress, transactionStatus, transactionHash, onSubmit } =
    useTransactionStatus(selectedNetwork);
  const onTxnCancel = useCallback(() => {
    updateState({ ...clearTradeState });
  }, [updateState]);

  useEffect(() => {
    trackEvent(TRACKING_EVENTS.CONFIRMATION, {
      selectedNetwork,
      tradeType,
      path: location.pathname,
      routeType: location.state?.routeType || 'unknown',
    });
    // NOTE: only execute once on page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ minHeight: theme.spacing(162) }}>
      <ScrollToTop />
      <StatusHeading
        heading={heading}
        transactionStatus={
          transactionError
            ? TransactionStatus.ERROR_BUILDING
            : transactionStatus
        }
      />
      <TermsOfService theme={theme}>
        {transactionStatus === TransactionStatus.NONE && (
          <FormattedMessage
            defaultMessage={
              'By submitting a trade on our platform you agree to our <a>terms of service.</a>'
            }
            values={{
              a: (msg: React.ReactNode) => (
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
          selectedNetwork={selectedNetwork}
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
      {simulationError && (
        <Box sx={{ marginBottom: theme.spacing(6) }}>
          <ErrorMessage
            variant="warning"
            marginBottom
            message={simulationError}
          />
        </Box>
      )}
      {(transactionStatus === TransactionStatus.NONE ||
        transactionStatus === TransactionStatus.WAIT_USER_CONFIRM) &&
        transactionError === undefined && <PortfolioCompare state={state} />}
      <TransactionButtons
        network={selectedNetwork}
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
        onCancel={() => {
          onTxnCancel();
          if (onCancel) onCancel();
        }}
        onReturnToForm={() => {
          onTxnCancel();
          if (onReturnToForm) onReturnToForm();
        }}
        isDisabled={isReadOnlyAddress || !!transactionError}
        isLoaded={populatedTransaction !== undefined}
      />
    </Box>
  );
};

export const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    color: ${theme.palette.typography.light};
    font-size: 14px;
  `
);

export default TransactionConfirmation;
