import { useCallback, useEffect } from 'react';
import { Drawer } from '@notional-finance/mui';
import { trackEvent, RouteState } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { Divider, styled, useTheme, Box } from '@mui/material';
import { useLocation } from 'react-router';
import {
  ExternalLink,
  HeadingSubtitle,
  ErrorMessage,
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
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export interface TransactionConfirmationProps {
  heading: React.ReactNode;
  context: BaseTradeContext | VaultContext;
  onCancel?: () => void;
  onReturnToForm?: () => void;
  showDrawer?: boolean;
  isWithdraw?: boolean;
}

export const TransactionConfirmation = ({
  heading,
  context,
  onCancel,
  onReturnToForm,
  showDrawer = true,
}: TransactionConfirmationProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const location = useLocation<RouteState>();
  const selectedNetwork = useSelectedNetwork();
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

  const inner = (
    <>
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
        transactionError === undefined && <PortfolioCompare state={state} />}
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

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(3)};
    color: ${theme.palette.typography.light};
    font-size: 14px;
  `
);

export default TransactionConfirmation;
